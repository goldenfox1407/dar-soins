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
        return response()->json(RetourAchat::with(['fournisseur', 'entrepot', 'achat'])->orderBy('created_at', 'desc')->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|unique:retour_achats,reference|max:255',
            'achat_id' => 'required|exists:achats,id',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'entrepot_id' => 'required|exists:entrepots,id',
            'statut' => 'required|in:Termine,En attente',
            'montant_total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.cout_unitaire' => 'required|numeric|min:0',
            'lignes.*.sous_total' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $retour = RetourAchat::create($request->except('lignes'));

            foreach ($request->lignes as $ligne) {
                $retour->lignes()->create($ligne);

                // Update stock if status is 'Termine'
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

            return response()->json($retour->load(['fournisseur', 'entrepot', 'lignes.produit']), 201);
        });
    }

    public function show($id)
    {
        return response()->json(RetourAchat::with(['fournisseur', 'entrepot', 'achat', 'lignes.produit'])->findOrFail($id));
    }
}
