<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RetourVente;
use App\Models\RetourVenteLigne;
use App\Models\Produit;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;

class RetourVenteController extends Controller
{
    public function index()
    {
        $retours = RetourVente::with(['vente', 'client.user', 'entrepot', 'user', 'lignes.produit'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $retours]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vente_id' => 'nullable|exists:ventes,id',
            'client_id' => 'nullable|exists:clients,id',
            'entrepot_id' => 'nullable|exists:entrepots,id',
            'statut' => 'required|in:complete,en_attente,annule',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $reference = 'REF-RETV-' . strtoupper(substr(uniqid(), -6));
            $montantTotal = 0;

            foreach ($request->lignes as $line) {
                $montantTotal += $line['quantite'] * $line['prix_unitaire'];
            }

            $retourVente = RetourVente::create([
                'reference' => $reference,
                'vente_id' => $request->vente_id,
                'client_id' => $request->client_id,
                'entrepot_id' => $request->entrepot_id,
                'statut' => $request->statut,
                'montant_total' => $montantTotal,
                'notes' => $request->notes,
                'user_id' => $request->user()?->id,
            ]);

            foreach ($request->lignes as $line) {
                $sousTotal = $line['quantite'] * $line['prix_unitaire'];

                RetourVenteLigne::create([
                    'retour_vente_id' => $retourVente->id,
                    'produit_id' => $line['produit_id'],
                    'quantite' => $line['quantite'],
                    'prix_unitaire' => $line['prix_unitaire'],
                    'sous_total' => $sousTotal,
                ]);

                // Increment returned product stock if status is complete
                if ($request->statut === 'complete') {
                    $produit = Produit::find($line['produit_id']);
                    if ($produit) {
                        $produit->increment('stock_initial', $line['quantite']);
                    }
                }
            }

            CacheService::forget('produits:all');

            return response()->json([
                'message' => 'Retour de vente enregistré avec succès',
                'data' => $retourVente->load(['vente', 'client.user', 'entrepot', 'user', 'lignes.produit'])
            ], 201);
        });
    }

    public function show($id)
    {
        $retourVente = RetourVente::with(['vente', 'client.user', 'entrepot', 'user', 'lignes.produit'])->findOrFail($id);
        return response()->json(['data' => $retourVente]);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:complete,en_attente,annule'
        ]);

        $retourVente = RetourVente::findOrFail($id);
        $oldStatut = $retourVente->statut;
        $retourVente->update(['statut' => $request->statut]);

        // If changing to complete from another status, restock products
        if ($oldStatut !== 'complete' && $request->statut === 'complete') {
            foreach ($retourVente->lignes as $line) {
                $produit = Produit::find($line->produit_id);
                if ($produit) {
                    $produit->increment('stock_initial', $line->quantite);
                }
            }
            CacheService::forget('produits:all');
        }

        return response()->json([
            'message' => 'Statut du retour de vente mis à jour',
            'data' => $retourVente->load(['vente', 'client.user', 'entrepot', 'user', 'lignes.produit'])
        ]);
    }

    public function destroy($id)
    {
        $retourVente = RetourVente::findOrFail($id);
        $retourVente->delete();

        return response()->json(['message' => 'Retour de vente supprimé avec succès']);
    }
}
