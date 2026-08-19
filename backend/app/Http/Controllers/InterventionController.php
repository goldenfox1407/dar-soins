<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use App\Models\Localisation;
use App\Models\Materiel;
use App\Models\Consommation;
use App\Models\ConstanteMedicale;
use App\Models\User;
use App\Notifications\GenericSystemNotification;
use App\Http\Resources\InterventionResource;
use App\Http\Resources\FactureResource;
use App\Http\Resources\DevisResource;
use App\Http\Requests\CommanderSoinRequest;
use App\Http\Requests\CloturerInterventionRequest;
use App\Services\ServiceAffectation;
use App\Services\ServiceGeolocalisation;
use App\Services\ServiceTarification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Traits\ApiResponseTrait;

class InterventionController extends Controller
{
    use ApiResponseTrait;

    protected $affectationService;
    protected $tarificationService;

    public function __construct(ServiceAffectation $affectation, ServiceTarification $tarification)
    {
        $this->affectationService = $affectation;
        $this->tarificationService = $tarification;
    }

    /**
     * Get interventions for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('client')) {
            $interventions = Intervention::with(['infirmier.user', 'produit', 'constantes', 'devis', 'facture', 'consommations.produit'])
                ->where('client_id', $user->client->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($interventions);
        } elseif ($user->hasRole('infirmier')) {
            $interventions = Intervention::with(['client.user', 'produit', 'devis', 'localisation', 'facture', 'constantes', 'consommations.produit'])
                ->where('infirmier_id', $user->infirmier->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($interventions);
        }

        return response()->json(['message' => 'Non autorisé'], 403);
    }

    /**
     * U.S1 & U.S7: Client commands care, gets assigned nearest nurse, and gets an estimate
     */
    public function commanderSoin(CommanderSoinRequest $request)
    {
        $user = Auth::user();

        $path = null;
        if ($request->hasFile('fichier_joint')) {
            $path = $request->file('fichier_joint')->store('interventions', 'public');
        }

        $intervention = DB::transaction(function () use ($user, $request, $path) {
            $localisation = Localisation::create([
                'latitude'  => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            return Intervention::create([
                'client_id'           => $user->client->id,
                'infirmier_id'        => null,
                'produit_id'          => $request->produit_id,
                'localisation_id'     => $localisation->id,
                'date_heure'          => $request->date_heure,
                'type'                => $request->type,
                'duree_heures'        => $request->duree_heures,
                'statut'              => 'en_attente_affectation',
                'description_probleme'=> $request->description_probleme,
                'fichier_joint'       => $path,
            ]);
        });

        // Notifier tous les gestionnaires / admins
        try {
            $intervention->load(['produit']);
            $admins = User::where('role', 'gestionnaire')
                ->orWhereHas('roles', fn($q) => $q->where('name', 'gestionnaire'))
                ->get();
            $clientNom = $user->name ?: trim(($user->prenom ?? '') . ' ' . ($user->nom ?? ''));
            $soinNom = $intervention->produit ? $intervention->produit->nom : 'Soin infirmier';

            foreach ($admins as $admin) {
                $admin->notify(new GenericSystemNotification(
                    "Nouvelle Demande d'Intervention",
                    "Le client {$clientNom} a demandé un soin : {$soinNom}.",
                    'nouvelle_intervention',
                    '🏥',
                    '/gestionnaire'
                ));
            }
        } catch (\Exception $e) {
            Log::error("Erreur notification nouvelle intervention : " . $e->getMessage());
        }

        return response()->json([
            'message'      => 'Commande enregistrée, en attente de validation',
            'intervention' => new InterventionResource($intervention->load(['produit'])),
        ], 201);
    }

    /**
     * U.S2, U.S3, U.S5: Infirmier checks in, adds vitals, adds consumables
     */
    public function cloturerIntervention(CloturerInterventionRequest $request, $id)
    {
        $intervention = Intervention::findOrFail($id);
        $user         = Auth::user();
        $isInfirmier  = ($user->role === 'infirmier') || (method_exists($user, 'hasRole') && $user->hasRole('infirmier'));
        if ($isInfirmier && (!$user->infirmier || (int)$intervention->infirmier_id !== (int)$user->infirmier->id)) {
            return response()->json(['message' => 'Non autorisé. Cette intervention ne vous est pas assignée.'], 403);
        }

        $intervention->load(['infirmier', 'localisation']);

        if ($intervention->distance_manuelle !== null) {
            $distance = $intervention->distance_manuelle;
        } elseif (
            $intervention->infirmier &&
            $intervention->infirmier->latitude &&
            $intervention->infirmier->longitude &&
            $intervention->localisation
        ) {
            $distance = app(ServiceGeolocalisation::class)->calculerDistance(
                $intervention->localisation->latitude,
                $intervention->localisation->longitude,
                $intervention->infirmier->latitude,
                $intervention->infirmier->longitude
            );
        } else {
            return response()->json([
                'message' => 'Distance non disponible. Veuillez saisir la distance manuellement avant de clôturer.',
            ], 422);
        }

        [$intervention, $facture] = DB::transaction(function () use ($intervention, $request, $distance) {
            if ($request->has('tension') || $request->has('glycemie') || $request->has('temperature') || $request->has('poids')) {
                ConstanteMedicale::create([
                    'intervention_id' => $intervention->id,
                    'tension'         => $request->tension,
                    'glycemie'        => $request->glycemie,
                    'temperature'     => $request->temperature,
                    'poids'           => $request->poids,
                    'date'            => now(),
                ]);
            }

            $intervention->fill(array_filter([
                'notes_infirmier'   => $request->notes_infirmier,
                'methode_paiement'  => $request->methode_paiement,
                'montant_recu'      => $request->montant_recu,
                'signature_patient' => $request->signature_patient,
            ], fn($v) => $v !== null));

            if ($request->has('consommations')) {
                foreach ($request->consommations as $conso) {
                    Consommation::create([
                        'intervention_id' => $intervention->id,
                        'produit_id'      => $conso['produit_id'],
                        'quantite'        => $conso['quantite'],
                    ]);
                }
            }

            $intervention->statut = 'terminee';
            $intervention->save();

            $facture = $this->tarificationService->calculerFacture($intervention, $distance);

            return [$intervention, $facture];
        });

        try {
            $intervention->load(['client.user', 'produit']);
            $clientNom = $intervention->client?->user?->name ?? 'Un client';
            $admins = User::where('role', 'gestionnaire')
                ->orWhereHas('roles', fn($q) => $q->where('name', 'gestionnaire'))
                ->get();
            foreach ($admins as $admin) {
                $admin->notify(new GenericSystemNotification(
                    "Intervention Clôturée",
                    "L'intervention pour le client {$clientNom} a été clôturée.",
                    'intervention_cloturee',
                    '🏁',
                    '/gestionnaire'
                ));
            }
        } catch (\Exception $e) {
            Log::error("Erreur notification clôture intervention : " . $e->getMessage());
        }

        return response()->json([
            'message'      => 'Intervention clôturée avec succès',
            'intervention' => new InterventionResource($intervention->load(['constantes', 'consommations'])),
            'facture'      => new FactureResource($facture),
        ]);
    }

    /**
     * Arrivée sur site (Check-In)
     */
    public function arriverSurSite(Request $request, $id)
    {
        $intervention = Intervention::findOrFail($id);
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $isInfirmier = ($user->role === 'infirmier') || (method_exists($user, 'hasRole') && $user->hasRole('infirmier'));
        if (!$isInfirmier) {
            return response()->json(['message' => 'Non autorisé. Rôle soignant requis.'], 403);
        }

        if (!$user->infirmier) {
            return response()->json(['message' => 'Profil soignant introuvable pour ce compte.'], 404);
        }

        if ((int)$intervention->infirmier_id !== (int)$user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé. Cette mission ne vous est pas assignée.'], 403);
        }

        if (in_array($intervention->statut, ['terminee', 'annulee'])) {
            return response()->json(['message' => 'Cette mission est déjà terminée ou annulée.'], 422);
        }

        $request->validate([
            'photo' => 'required|file|mimes:jpeg,png,jpg,gif,webp,heic,heif,bmp|max:15360'
        ], [
            'photo.required' => 'La photo selfie d\'arrivée est obligatoire.',
            'photo.file' => 'Le fichier photo est invalide.',
            'photo.mimes' => 'Format d\'image non supporté (utilisez JPG, PNG, WEBP, HEIC, etc.).',
            'photo.max' => 'La photo ne doit pas dépasser 15 Mo.'
        ]);

        $path = $request->file('photo')->store('interventions/arrivees', 'public');
        $intervention->photo_validation_arrivee = $path;
        $intervention->statut = 'en_cours';
        $intervention->save();

        try {
            $intervention->load(['client.user', 'produit']);
            $clientNom = $intervention->client?->user?->name ?? 'Un patient';
            $infirmierNom = $user->name ?: trim(($user->prenom ?? '') . ' ' . ($user->nom ?? ''));
            $soinNom = $intervention->produit ? $intervention->produit->nom : 'Soin';
            $admins = User::where('role', 'gestionnaire')
                ->orWhereHas('roles', fn($q) => $q->where('name', 'gestionnaire'))
                ->get();

            foreach ($admins as $admin) {
                $admin->notify(new GenericSystemNotification(
                    "Soignant arrivé sur site",
                    "L'infirmier {$infirmierNom} est arrivé chez {$clientNom} pour {$soinNom}.",
                    'infirmier_arrive',
                    '📍',
                    '/gestionnaire'
                ));
            }
        } catch (\Exception $e) {
            Log::error("Erreur notification arrivée infirmier : " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Arrivée confirmée avec succès.',
            'intervention' => $intervention
        ]);
    }

    /**
     * V2 Workflow
     * 1. Get nearest nurses for map (Gestionnaire)
     */
    public function infirmiersProches(Request $request, $id)
    {
        $intervention = Intervention::with('localisation')->findOrFail($id);
        
        $ignoredIds = $intervention->infirmiers_refuses()->pluck('infirmiers.id')->toArray();
        $infirmiers = \App\Models\Infirmier::where('est_disponible', true)
                        ->whereNotIn('id', $ignoredIds)
                        ->whereNotNull('latitude')
                        ->whereNotNull('longitude')
                        ->with(['user'])
                        ->get();

        $infirmiersAvecDistance = [];
        foreach ($infirmiers as $inf) {
            $distance = app(\App\Services\ServiceGeolocalisation::class)->calculerDistance(
                $intervention->localisation->latitude, $intervention->localisation->longitude,
                $inf->latitude, $inf->longitude
            );
            $inf->distance_km = round($distance, 2);
            $inf->lat = $inf->latitude;
            $inf->lng = $inf->longitude;
            $infirmiersAvecDistance[] = $inf;
        }

        // Sort by distance
        usort($infirmiersAvecDistance, fn($a, $b) => $a->distance_km <=> $b->distance_km);

        return response()->json([
            'client_localisation' => $intervention->localisation,
            'infirmiers' => $infirmiersAvecDistance
        ]);
    }

    /**
     * 2. Affecter manuellement depuis la carte (Gestionnaire)
     */
    public function affecterManuellement(Request $request, $id)
    {
        $request->validate([
            'infirmier_id' => 'required|exists:infirmiers,id',
            'distance_manuelle' => 'nullable|numeric|min:0',
            'tarif_km_manuel' => 'nullable|numeric|min:0'
        ]);
        
        $intervention = Intervention::with('produit')->findOrFail($id);
        $intervention->infirmier_id = $request->infirmier_id;
        
        if ($request->has('distance_manuelle')) {
            $intervention->distance_manuelle = $request->distance_manuelle;
        }
        if ($request->has('tarif_km_manuel')) {
            $intervention->tarif_km_manuel = $request->tarif_km_manuel;
        }
        
        if ($intervention->produit->type === 'garde') {
            $intervention->statut = 'infirmier_accepte';
        } else {
            $intervention->statut = 'en_attente_reponse_infirmier';
        }
        $intervention->save();

        return response()->json([
            'message' => 'Infirmier affecté avec succès. En attente de sa confirmation.',
            'intervention' => $intervention
        ]);
    }

    /**
     * 3. Infirmier répond (Infirmier)
     */
    public function repondreInfirmier(Request $request, $id)
    {
        $request->validate(['accepte' => 'required|boolean']);
        $intervention = Intervention::with(['client.user', 'produit'])->findOrFail($id);
        $user = Auth::user() ?? $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié. Veuillez vous reconnecter.'], 401);
        }

        $isInfirmier = ($user->role === 'infirmier') || (method_exists($user, 'hasRole') && $user->hasRole('infirmier'));
        if (!$isInfirmier) {
            return response()->json(['message' => 'Non autorisé. Rôle soignant requis.'], 403);
        }

        if (!$user->infirmier) {
            return response()->json(['message' => 'Profil soignant introuvable pour cet utilisateur.'], 403);
        }

        if ((int)$intervention->infirmier_id !== (int)$user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé. Cette intervention ne vous est pas assignée.'], 403);
        }

        $infirmierNom = $user->name ?: trim(($user->prenom ?? '') . ' ' . ($user->nom ?? ''));
        $clientNom = $intervention->client?->user?->name ?? 'Un patient';
        $soinNom = $intervention->produit?->nom ?? 'Soin infirmier';

        $admins = User::where('role', 'gestionnaire')
            ->orWhereHas('roles', fn($q) => $q->where('name', 'gestionnaire'))
            ->get();

        if ($request->accepte) {
            $intervention->statut = 'infirmier_accepte';
            $intervention->save();

            try {
                foreach ($admins as $admin) {
                    $admin->notify(new GenericSystemNotification(
                        "Mission acceptée par le soignant",
                        "L'infirmier {$infirmierNom} a accepté la mission pour {$clientNom} ({$soinNom}).",
                        'infirmier_accepte',
                        '🩺',
                        '/gestionnaire'
                    ));
                }
            } catch (\Exception $e) {
                Log::error("Erreur notification acceptation infirmier : " . $e->getMessage());
            }

            return response()->json(['message' => 'Intervention acceptée avec succès. En attente du devis gestionnaire.']);
        } else {
            if (method_exists($intervention, 'infirmiers_refuses')) {
                $intervention->infirmiers_refuses()->syncWithoutDetaching([$user->infirmier->id]);
            }
            $intervention->infirmier_id = null;
            $intervention->statut = 'en_attente_affectation'; // Return to manager map
            $intervention->save();

            try {
                foreach ($admins as $admin) {
                    $admin->notify(new GenericSystemNotification(
                        "Mission refusée par le soignant",
                        "L'infirmier {$infirmierNom} a décliné l'intervention pour {$clientNom} ({$soinNom}). Réassignation nécessaire.",
                        'infirmier_refus',
                        '⚠️',
                        '/gestionnaire'
                    ));
                }
            } catch (\Exception $e) {
                Log::error("Erreur notification refus infirmier : " . $e->getMessage());
            }

            return response()->json(['message' => 'Intervention refusée.']);
        }
    }

    /**
     * 4. Générer le Devis PDF (Gestionnaire)
     */
    public function genererDevis(Request $request, $id)
    {
        $intervention = Intervention::with(['produit', 'client.user', 'localisation', 'infirmier'])->findOrFail($id);
        
        if ($intervention->distance_manuelle !== null) {
            $distance = $intervention->distance_manuelle;
        } elseif ($intervention->infirmier && $intervention->infirmier->latitude && $intervention->infirmier->longitude) {
            $distance = app(\App\Services\ServiceGeolocalisation::class)->calculerDistance(
                $intervention->localisation->latitude, $intervention->localisation->longitude,
                $intervention->infirmier->latitude, $intervention->infirmier->longitude
            );
        } else {
            $distance = 0; // GPS infirmier non renseigné
        }

        $devis = $this->tarificationService->calculerDevis($intervention, $distance);
        
        $intervention->statut = 'devis_genere';
        $intervention->save();

        return response()->json([
            'message' => 'Devis généré avec succès en base de données.',
            'devis' => $devis
        ]);
    }

    /**
     * 5. Envoyer Devis par mail (Gestionnaire)
     */
    public function envoyerDevis(Request $request, $id)
    {
        $intervention = Intervention::with(['produit', 'client.user', 'localisation', 'infirmier', 'devis'])->findOrFail($id);
        
        if (!$intervention->devis) {
            return response()->json(['message' => 'Aucun devis généré pour cette intervention.'], 400);
        }

        $config = \App\Models\Config::firstOrFail();
        $devise = $config->devise_defaut ?? 'MAD';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.devis', [
            'intervention' => $intervention,
            'devis' => $intervention->devis,
            'config' => $config,
            'devise' => $devise
        ]);
        $pdfContent = $pdf->output();

        \Illuminate\Support\Facades\Mail::to($intervention->client->user->email)
            ->send(new \App\Mail\DevisInterventionMail($intervention, $intervention->devis, $pdfContent));

        $intervention->statut = 'en_attente_reponse_client';
        $intervention->save();

        $intervention->devis->statut = 'envoye';
        $intervention->devis->save();

        return response()->json(['message' => 'Devis envoyé avec succès.']);
    }

    /**
     * 6. Client répond au devis (Client)
     */
    public function repondreDevisClient(Request $request, $id)
    {
        $request->validate(['accepte' => 'required|boolean']);
        $intervention = Intervention::with(['devis', 'client'])->findOrFail($id);

        if ($intervention->client->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $intervention->load(['client.user', 'produit']);
        $clientNom = $intervention->client?->user?->name ?? 'Un client';
        $admins = User::where('role', 'gestionnaire')
            ->orWhereHas('roles', fn($q) => $q->where('name', 'gestionnaire'))
            ->get();

        if ($request->accepte) {
            $intervention->statut = 'acceptee';
            if ($intervention->devis) {
                $intervention->devis->statut = 'accepte';
                $intervention->devis->save();
            }
            $intervention->save();

            try {
                foreach ($admins as $admin) {
                    $admin->notify(new GenericSystemNotification(
                        "Devis Accepté par le client",
                        "Le client {$clientNom} a validé le devis de son soin.",
                        'devis_accepte',
                        '✅',
                        '/gestionnaire'
                    ));
                }
            } catch (\Exception $e) {
                Log::error("Erreur notification devis accepté : " . $e->getMessage());
            }

            return response()->json(['message' => 'Devis accepté. Soin confirmé.']);
        } else {
            $intervention->statut = 'annulee';
            if ($intervention->devis) {
                $intervention->devis->statut = 'refuse';
                $intervention->devis->save();
            }
            $intervention->save();

            try {
                foreach ($admins as $admin) {
                    $admin->notify(new GenericSystemNotification(
                        "Devis Refusé par le client",
                        "Le client {$clientNom} a refusé le devis de son soin.",
                        'devis_refuse',
                        '❌',
                        '/gestionnaire'
                    ));
                }
            } catch (\Exception $e) {
                Log::error("Erreur notification devis refusé : " . $e->getMessage());
            }

            return response()->json(['message' => 'Devis refusé. Intervention annulée.']);
        }
    }

    /**
     * 7. Client annule sa demande de soin (avant acceptation du devis)
     */
    public function annulerClient(Request $request, $id)
    {
        $intervention = Intervention::with(['devis', 'client.user', 'produit'])->findOrFail($id);
        $user = Auth::user();

        if ($intervention->client->user_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // On ne peut annuler que si l'intervention n'a pas encore été acceptée, commencée ou clôturée
        $statutsNonAnnulables = ['acceptee', 'en_cours', 'terminee', 'annulee'];
        if (in_array($intervention->statut, $statutsNonAnnulables)) {
            return response()->json([
                'message' => 'Impossible d\'annuler cette demande de soin dans son état actuel.'
            ], 422);
        }

        $intervention->statut = 'annulee';
        if ($intervention->devis) {
            $intervention->devis->statut = 'refuse';
            $intervention->devis->save();
        }
        $intervention->save();

        // Notifier les gestionnaires
        try {
            $clientNom = $user->name ?: trim(($user->prenom ?? '') . ' ' . ($user->nom ?? ''));
            $soinNom = $intervention->produit ? $intervention->produit->nom : 'Soin infirmier';
            $admins = User::where('role', 'gestionnaire')
                ->orWhereHas('roles', fn($q) => $q->where('name', 'gestionnaire'))
                ->get();

            foreach ($admins as $admin) {
                $admin->notify(new GenericSystemNotification(
                    "Demande de soin annulée par le client",
                    "Le client {$clientNom} a annulé sa demande de soin : {$soinNom}.",
                    'intervention_annulee',
                    '🚫',
                    '/gestionnaire'
                ));
            }
        } catch (\Exception $e) {
            Log::error("Erreur notification annulation intervention : " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Demande de soin annulée avec succès.',
            'intervention' => $intervention
        ]);
    }
}
