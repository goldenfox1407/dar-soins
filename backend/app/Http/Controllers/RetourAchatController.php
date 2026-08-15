<?php

namespace App\Http\Controllers;

use App\Models\RetourAchat;
use App\Models\Achat;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RetourAchatController extends Controller
{
    public function index()
    {
        $retours = RetourAchat::with(['fournisseur', 'entrepot', 'achat', 'lignes.produit'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $retours]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'achat_id' => 'required|exists:achats,id',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'entrepot_id' => 'required|exists:entrepots,id',
            'statut' => 'required|in:Termine,En attente,Annule',
            'montant_total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.cout_unitaire' => 'required|numeric|min:0',
            'lignes.*.sous_total' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $reference = $request->reference;
            if (!$reference) {
                $todayStr = now()->format('Ymd');
                $randNum = rand(1000, 9999);
                $reference = "RT-ACH-{$todayStr}-{$randNum}";
            }

            $data = $request->except('lignes');
            $data['reference'] = $reference;

            $retour = RetourAchat::create($data);

            foreach ($request->lignes as $ligne) {
                $retour->lignes()->create($ligne);

                // Update warehouse stock if status is 'Termine'
                if ($request->statut === 'Termine') {
                    $stock = DB::table('produit_entrepot')
                        ->where('produit_id', $ligne['produit_id'])
                        ->where('entrepot_id', $request->entrepot_id)
                        ->first();

                    if ($stock) {
                        DB::table('produit_entrepot')
                            ->where('id', $stock->id)
                            ->decrement('quantite', $ligne['quantite']);
                    } else {
                        DB::table('produit_entrepot')->insert([
                            'produit_id' => $ligne['produit_id'],
                            'entrepot_id' => $request->entrepot_id,
                            'quantite' => -$ligne['quantite'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'Retour d\'achat créé avec succès',
                'data' => $retour->load(['fournisseur', 'entrepot', 'achat', 'lignes.produit'])
            ], 201);
        });
    }

    public function show($id)
    {
        $retour = RetourAchat::with(['fournisseur', 'entrepot', 'achat', 'lignes.produit'])->findOrFail($id);
        return response()->json(['data' => $retour]);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:Termine,En attente,Annule'
        ]);

        return DB::transaction(function () use ($request, $id) {
            $retour = RetourAchat::with('lignes')->findOrFail($id);
            $ancienStatut = $retour->statut;
            $nouveauStatut = $request->statut;

            if ($ancienStatut !== $nouveauStatut) {
                // If transitioning to Termine, deduct stock
                if ($nouveauStatut === 'Termine' && $ancienStatut !== 'Termine') {
                    foreach ($retour->lignes as $ligne) {
                        DB::table('produit_entrepot')
                            ->where('produit_id', $ligne->produit_id)
                            ->where('entrepot_id', $retour->entrepot_id)
                            ->decrement('quantite', $ligne->quantite);
                    }
                }
                // If transitioning from Termine to Annule / En attente, restore stock
                else if ($ancienStatut === 'Termine' && $nouveauStatut !== 'Termine') {
                    foreach ($retour->lignes as $ligne) {
                        DB::table('produit_entrepot')
                            ->where('produit_id', $ligne->produit_id)
                            ->where('entrepot_id', $retour->entrepot_id)
                            ->increment('quantite', $ligne->quantite);
                    }
                }

                $retour->update(['statut' => $nouveauStatut]);
            }

            return response()->json([
                'message' => 'Statut du retour d\'achat mis à jour',
                'data' => $retour->load(['fournisseur', 'entrepot', 'achat', 'lignes.produit'])
            ]);
        });
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $retour = RetourAchat::with('lignes')->findOrFail($id);

            // Revert stock if it was 'Termine'
            if ($retour->statut === 'Termine') {
                foreach ($retour->lignes as $ligne) {
                    DB::table('produit_entrepot')
                        ->where('produit_id', $ligne->produit_id)
                        ->where('entrepot_id', $retour->entrepot_id)
                        ->increment('quantite', $ligne->quantite);
                }
            }

            $retour->delete();
            return response()->json(['message' => 'Retour d\'achat supprimé avec succès']);
        });
    }
}
