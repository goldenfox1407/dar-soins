<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transfert;
use App\Models\TransfertLigne;
use App\Models\Produit;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;

class TransfertController extends Controller
{
    public function index()
    {
        $transferts = Transfert::with(['entrepotSource', 'entrepotDestination', 'user', 'lignes.produit'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $transferts]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'entrepot_source_id' => 'nullable|exists:entrepots,id',
            'entrepot_destination_id' => 'nullable|exists:entrepots,id',
            'date' => 'required|date',
            'statut' => 'required|in:en_attente,complete,annule',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $reference = 'REF-TRANS-' . strtoupper(substr(uniqid(), -6));
            $totalProduits = count($request->lignes);

            $transfert = Transfert::create([
                'reference' => $reference,
                'entrepot_source_id' => $request->entrepot_source_id,
                'entrepot_destination_id' => $request->entrepot_destination_id,
                'date' => $request->date,
                'statut' => $request->statut,
                'total_produits' => $totalProduits,
                'notes' => $request->notes,
                'user_id' => $request->user()?->id,
            ]);

            foreach ($request->lignes as $line) {
                TransfertLigne::create([
                    'transfert_id' => $transfert->id,
                    'produit_id' => $line['produit_id'],
                    'quantite' => $line['quantite'],
                ]);
            }

            return response()->json([
                'message' => 'Transfert de stock créé avec succès',
                'data' => $transfert->load(['entrepotSource', 'entrepotDestination', 'user', 'lignes.produit'])
            ], 201);
        });
    }

    public function show($id)
    {
        $transfert = Transfert::with(['entrepotSource', 'entrepotDestination', 'user', 'lignes.produit'])->findOrFail($id);
        return response()->json(['data' => $transfert]);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:en_attente,complete,annule'
        ]);

        $transfert = Transfert::findOrFail($id);
        $transfert->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut du transfert mis à jour',
            'data' => $transfert->load(['entrepotSource', 'entrepotDestination', 'user', 'lignes.produit'])
        ]);
    }

    public function destroy($id)
    {
        $transfert = Transfert::findOrFail($id);
        $transfert->delete();

        return response()->json(['message' => 'Transfert supprimé avec succès']);
    }
}
