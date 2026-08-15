<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contrat;
use Carbon\Carbon;

class ContratController extends Controller
{
    public function index()
    {
        $contrats = Contrat::with(['client.user', 'infirmier.user', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $contrats]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'infirmier_id' => 'nullable|exists:infirmiers,id',
            'type_garde' => 'required|in:nuit,jour,24h,post_operatoire,accompagnement_senior',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'horaires_garde' => 'nullable|string',
            'tarif_journalier' => 'required|numeric|min:0',
            'statut' => 'required|in:actif,termine,en_attente,resilie',
            'clauses_specifiques' => 'nullable|string',
            'prescriptions_medicales' => 'nullable|string',
        ]);

        $debut = Carbon::parse($request->date_debut);
        $fin = Carbon::parse($request->date_fin);
        $nbJours = max(1, $debut->diffInDays($fin) + 1);

        $montantTotal = $request->montant_total ?? ($nbJours * $request->tarif_journalier);

        $reference = 'CTR-2026-' . str_pad(Contrat::max('id') + 1, 4, '0', STR_PAD_LEFT);

        $contrat = Contrat::create([
            'reference' => $reference,
            'client_id' => $request->client_id,
            'infirmier_id' => $request->infirmier_id,
            'type_garde' => $request->type_garde,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'horaires_garde' => $request->horaires_garde,
            'tarif_journalier' => $request->tarif_journalier,
            'montant_total' => $montantTotal,
            'statut' => $request->statut,
            'clauses_specifiques' => $request->clauses_specifiques,
            'prescriptions_medicales' => $request->prescriptions_medicales,
            'user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Contrat de garde créé avec succès',
            'data' => $contrat->load(['client.user', 'infirmier.user', 'user'])
        ], 201);
    }

    public function show($id)
    {
        $contrat = Contrat::with(['client.user', 'infirmier.user', 'user'])->findOrFail($id);
        return response()->json(['data' => $contrat]);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:actif,termine,en_attente,resilie'
        ]);

        $contrat = Contrat::findOrFail($id);
        $contrat->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut du contrat mis à jour',
            'data' => $contrat->load(['client.user', 'infirmier.user', 'user'])
        ]);
    }

    public function destroy($id)
    {
        $contrat = Contrat::findOrFail($id);
        $contrat->delete();

        return response()->json(['message' => 'Contrat supprimé avec succès']);
    }
}
