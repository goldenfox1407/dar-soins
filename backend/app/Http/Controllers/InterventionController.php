<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use App\Models\Localisation;
use App\Models\Materiel;
use App\Models\Consommation;
use App\Models\ConstanteMedicale;
use App\Http\Resources\InterventionResource;
use App\Http\Resources\FactureResource;
use App\Http\Resources\DevisResource;
use App\Http\Requests\CommanderSoinRequest;
use App\Http\Requests\CloturerInterventionRequest;
use App\Services\ServiceAffectation;
use App\Services\ServiceGeolocalisation;
use App\Services\ServiceNotification;
use App\Services\ServiceTarification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InterventionController extends Controller
{
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
            $interventions = Intervention::with(['infirmier.user', 'produit', 'constantes', 'devis', 'facture'])
                ->where('client_id', $user->client->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($interventions);
        } elseif ($user->hasRole('infirmier')) {
            $interventions = Intervention::with(['client.user', 'produit', 'devis', 'localisation', 'facture'])
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

        // Notification : nouvelle demande d'intervention → gestionnaire(s)
        $this->dispatchNotifications('nouvelle_intervention', $intervention, [
            'url_cible' => "/gestionnaire/interventions/{$intervention->id}",
        ]);

        return response()->json([
            'message'      => 'Commande enregistrée, en attente de validation',
            'intervention' => new InterventionResource($intervention->load(['produit'])),
        ], 201);
    }

    /**
     * Helper interne pour dispatcher les notifications d'intervention.
     */
    protected function dispatchNotifications(string $evenement, Intervention $intervention, array $options = []): void
    {
        try {
            ServiceNotification::dispatcher($evenement, $intervention->load(['client.user', 'infirmier.user', 'produit', 'devis', 'facture']), $options);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Erreur notification {$evenement}: ".$e->getMessage(), [
                'intervention_id' => $intervention->id,
                'exception'       => $e,
            ]);
        }
    }

    /**
     * U.S2, U.S3, U.S5: Infirmier checks in, adds vitals, adds consumables
     */
    public function cloturerIntervention(CloturerInterventionRequest $request, $id)
    {
        $intervention = Intervention::findOrFail($id);
        $user         = Auth::user();

        if ($user->hasRole('infirmier') && $intervention->infirmier_id !== $user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
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

        // Notifications : Intervention clôturée → gestionnaire + client
        $this->dispatchNotifications('intervention_cloturee', $intervention);

        // Notification : Paiement reçu → gestionnaire (si paiement effectué)
        if ($request->methode_paiement && $facture) {
            try {
                ServiceNotification::dispatcher('paiement_recu', [
                    'reference' => $facture->reference,
                    'montant'   => $facture->montant_total,
                    'methode'   => $request->methode_paiement,
                    'type'      => 'intervention',
                    'id'        => $intervention->id,
                ], [
                    'url_cible' => "/gestionnaire/factures/{$facture->id}",
                ]);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Erreur notification paiement_recu: '.$e->getMessage());
            }
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

        if (!$user->hasRole('infirmier') || $intervention->infirmier_id !== $user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'photo' => 'required|image|max:5120'
        ]);

        $path = $request->file('photo')->store('interventions/arrivees', 'public');
        $intervention->photo_validation_arrivee = $path;
        $intervention->statut = 'en_cours';
        $intervention->save();

        return response()->json([
            'message' => 'Arrivée confirmée.',
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

        // Notification : Infirmier affecté → infirmier + client
        $this->dispatchNotifications('infirmier_affecte', $intervention, [
            'url_cible' => "/gestionnaire/interventions/{$intervention->id}",
        ]);

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
        $intervention = Intervention::findOrFail($id);
        $user = Auth::user();

        if (!$user->hasRole('infirmier')) {
            return response()->json(['message' => 'Non autorisé. Rôle incorrect.'], 403);
        }

        if (!$user->infirmier) {
            return response()->json(['message' => 'Profil infirmier introuvable pour cet utilisateur.'], 403);
        }

        if ($intervention->infirmier_id !== $user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé. Cette intervention ne vous est pas assignée.'], 403);
        }

        if ($request->accepte) {
            $intervention->statut = 'infirmier_accepte';
            $intervention->save();
            return response()->json(['message' => 'Intervention acceptée. En attente du devis gestionnaire.']);
        } else {
            $intervention->infirmiers_refuses()->attach($user->infirmier->id);
            $intervention->infirmier_id = null;
            $intervention->statut = 'en_attente_affectation'; // Return to manager map
            $intervention->save();
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

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.devis', ['intervention' => $intervention, 'devis' => $intervention->devis]);
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

        if ($request->accepte) {
            $intervention->statut = 'acceptee';
            if ($intervention->devis) {
                $intervention->devis->statut = 'accepte';
                $intervention->devis->save();
            }
            $intervention->save();

            // Notification : Devis accepté → gestionnaire + infirmier
            $this->dispatchNotifications('devis_accepte', $intervention->load('devis'), [
                'url_cible' => "/gestionnaire/interventions/{$intervention->id}",
            ]);

            return response()->json(['message' => 'Devis accepté. Soin confirmé.']);
        } else {
            $intervention->statut = 'annulee';
            if ($intervention->devis) {
                $intervention->devis->statut = 'refuse';
                $intervention->devis->save();
            }
            $intervention->save();

            // Notification : Devis refusé → gestionnaire
            $this->dispatchNotifications('devis_refuse', $intervention->load('devis'), [
                'url_cible' => "/gestionnaire/interventions/{$intervention->id}",
            ]);

            return response()->json(['message' => 'Devis refusé. Intervention annulée.']);
        }
    }
}
