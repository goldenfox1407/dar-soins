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
use App\Services\ServiceAffectation;
use App\Services\ServiceTarification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        if ($user->role === 'client') {
            $interventions = Intervention::with(['infirmier.user', 'produit', 'constantes', 'devis', 'facture'])
                ->where('client_id', $user->client->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($interventions);
        } elseif ($user->role === 'infirmier') {
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
    public function commanderSoin(Request $request)
    {
        $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'type' => 'required|in:ponctuel,garde_malade',
            'duree_heures' => 'nullable|numeric',
            'date_heure' => 'required|date',
            'description_probleme' => 'nullable|string',
            'fichier_joint' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ]);

        $user = Auth::user();
        if ($user->role !== 'client') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $localisation = Localisation::create([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude
        ]);

        $path = null;
        if ($request->hasFile('fichier_joint')) {
            $path = $request->file('fichier_joint')->store('interventions', 'public');
        }

        $intervention = Intervention::create([
            'client_id' => $user->client->id,
            'infirmier_id' => null,
            'produit_id' => $request->produit_id,
            'localisation_id' => $localisation->id,
            'date_heure' => $request->date_heure,
            'type' => $request->type,
            'duree_heures' => $request->duree_heures,
            'statut' => 'en_attente_affectation',
            'description_probleme' => $request->description_probleme,
            'fichier_joint' => $path
        ]);

        return response()->json([
            'message' => 'Commande enregistrée, en attente de validation',
            'intervention' => new InterventionResource($intervention->load(['produit']))
        ], 201);
    }

    /**
     * U.S2, U.S3, U.S5: Infirmier checks in, adds vitals, adds consumables
     */
    public function cloturerIntervention(Request $request, $id)
    {
        $intervention = Intervention::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'infirmier' || $intervention->infirmier_id !== $user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'tension' => 'nullable|string',
            'glycemie' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'poids' => 'nullable|numeric',
            'notes_infirmier' => 'nullable|string',
            'methode_paiement' => 'nullable|in:espece,carte,virement',
            'montant_recu' => 'nullable|numeric',
            'signature_patient' => 'nullable|string',
            'consommations' => 'nullable|array',
        ]);

        if ($request->has('tension') || $request->has('glycemie') || $request->has('temperature') || $request->has('poids')) {
            ConstanteMedicale::create([
                'intervention_id' => $intervention->id,
                'tension' => $request->tension,
                'glycemie' => $request->glycemie,
                'temperature' => $request->temperature,
                'poids' => $request->poids,
                'date' => now()
            ]);
        }

        if ($request->has('notes_infirmier')) {
            $intervention->notes_infirmier = $request->notes_infirmier;
        }
        if ($request->has('methode_paiement')) {
            $intervention->methode_paiement = $request->methode_paiement;
        }
        if ($request->has('montant_recu')) {
            $intervention->montant_recu = $request->montant_recu;
        }
        if ($request->has('signature_patient')) {
            $intervention->signature_patient = $request->signature_patient;
        }

        if ($request->has('consommations')) {
            foreach ($request->consommations as $conso) {
                Consommation::create([
                    'intervention_id' => $intervention->id,
                    'produit_id' => $conso['produit_id'],
                    'quantite' => $conso['quantite']
                ]);
            }
        }

        $intervention->statut = 'terminee';
        $intervention->save();

        // Calculate final distance if needed or use the one saved
        $distance = $intervention->distance_manuelle ?? 5.0; // Fallback
        
        $facture = $this->tarificationService->calculerFacture($intervention, $distance);

        return response()->json([
            'message' => 'Intervention clôturée avec succès',
            'intervention' => new InterventionResource($intervention->load(['constantes', 'consommations'])),
            'facture' => new FactureResource($facture)
        ]);
    }

    /**
     * Arrivée sur site (Check-In)
     */
    public function arriverSurSite(Request $request, $id)
    {
        $intervention = Intervention::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'infirmier' || $intervention->infirmier_id !== $user->infirmier->id) {
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
                        ->with(['user'])
                        ->get();

        $infirmiersAvecDistance = [];
        foreach ($infirmiers as $inf) {
            $infLat = $inf->latitude ?? 33.5731;
            $infLon = $inf->longitude ?? -7.5898;
            $distance = app(\App\Services\ServiceGeolocalisation::class)->calculerDistance(
                $intervention->localisation->latitude, $intervention->localisation->longitude,
                $infLat, $infLon
            );
            $inf->distance_km = round($distance, 2);
            $inf->lat = $infLat;
            $inf->lng = $infLon;
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
        $intervention = Intervention::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'infirmier') {
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
        } else {
            $infLat = $intervention->infirmier->latitude ?? 33.5731;
            $infLon = $intervention->infirmier->longitude ?? -7.5898;
            $distance = app(\App\Services\ServiceGeolocalisation::class)->calculerDistance(
                $intervention->localisation->latitude, $intervention->localisation->longitude,
                $infLat, $infLon
            );
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
        $intervention = Intervention::with('devis')->findOrFail($id);
        
        if ($request->accepte) {
            $intervention->statut = 'acceptee';
            if ($intervention->devis) {
                $intervention->devis->statut = 'accepte';
                $intervention->devis->save();
            }
            $intervention->save();
            return response()->json(['message' => 'Devis accepté. Soin confirmé.']);
        } else {
            $intervention->statut = 'annulee';
            if ($intervention->devis) {
                $intervention->devis->statut = 'refuse';
                $intervention->devis->save();
            }
            $intervention->save();
            return response()->json(['message' => 'Devis refusé. Intervention annulée.']);
        }
    }
}
