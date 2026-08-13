<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ajustement;
use App\Models\AjustementLigne;
use App\Models\Produit;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;

class AjustementController extends Controller
{
    public function index()
    {
        $ajustements = Ajustement::with(['entrepot', 'user', 'lignes.produit'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $ajustements]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'entrepot_id' => 'nullable|exists:entrepots,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.type' => 'required|in:add,sub',
            'lignes.*.quantite' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $reference = 'REF-AJUST-' . strtoupper(substr(uniqid(), -6));

            $totalProduits = count($request->lignes);

            $ajustement = Ajustement::create([
                'reference' => $reference,
                'entrepot_id' => $request->entrepot_id,
                'date' => $request->date,
                'total_produits' => $totalProduits,
                'notes' => $request->notes,
                'user_id' => $request->user()?->id,
            ]);

            foreach ($request->lignes as $line) {
                AjustementLigne::create([
                    'ajustement_id' => $ajustement->id,
                    'produit_id' => $line['produit_id'],
                    'type' => $line['type'],
                    'quantite' => $line['quantite'],
                ]);

                // Update stock in Produit
                $produit = Produit::find($line['produit_id']);
                if ($produit) {
                    if ($line['type'] === 'add') {
                        $produit->increment('stock_initial', $line['quantite']);
                    } else {
                        $produit->decrement('stock_initial', $line['quantite']);
                    }
                }
            }

            CacheService::forget('produits:all');

            return response()->json([
                'message' => 'Ajustement de stock enregistré avec succès',
                'data' => $ajustement->load(['entrepot', 'user', 'lignes.produit'])
            ], 201);
        });
    }

    public function show($id)
    {
        $ajustement = Ajustement::with(['entrepot', 'user', 'lignes.produit'])->findOrFail($id);
        return response()->json(['data' => $ajustement]);
    }

    public function destroy($id)
    {
        $ajustement = Ajustement::findOrFail($id);
        $ajustement->delete();

        return response()->json(['message' => 'Ajustement supprimé avec succès']);
    }
}
