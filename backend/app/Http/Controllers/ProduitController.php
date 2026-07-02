<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Http\Resources\ProduitResource;
use App\Services\CacheService;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    /**
     * Get all products (Public route available for the Home page)
     */
    public function index()
    {
        $produits = CacheService::remember('produits:all', 3600, function () {
            return ProduitResource::collection(Produit::with('materiels')->get());
        });

        return response()->json($produits);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'type' => 'required|in:soin,garde,consommable',
            'prix_client' => 'required|numeric|min:0',
            'prix_achat' => 'nullable|numeric|min:0',
            'stock_initial' => 'nullable|integer|min:0',
            'remuneration_soignant' => 'nullable|numeric|min:0',
            'type_remise' => 'in:none,percent,fixed',
            'valeur_remise' => 'numeric|min:0'
        ]);

        $data = $request->except(['materiels', 'image']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $data['image'] = $path;
        }

        $produit = Produit::create($data);

        if ($request->has('materiels')) {
            $syncData = [];
            foreach ($request->materiels as $mat) {
                $syncData[$mat['materiel_id']] = ['quantite_requise' => $mat['quantite_requise'] ?? 1];
            }
            $produit->materiels()->sync($syncData);
        }

        CacheService::forget('produits:all');

        return response()->json([
            'message' => 'Produit créé avec succès',
            'produit' => new ProduitResource($produit->load('materiels'))
        ], 201);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $request->validate([
            'nom' => 'string|max:255',
            'type' => 'in:soin,garde,consommable',
            'prix_client' => 'numeric|min:0',
            'prix_achat' => 'nullable|numeric|min:0',
            'stock_initial' => 'nullable|integer|min:0',
            'remuneration_soignant' => 'nullable|numeric|min:0',
            'type_remise' => 'in:none,percent,fixed',
            'valeur_remise' => 'numeric|min:0',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except(['materiels', 'image']);
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $data['image'] = $path;
        }

        $produit->update($data);

        if ($request->has('materiels')) {
            $syncData = [];
            foreach ($request->materiels as $mat) {
                $syncData[$mat['materiel_id']] = ['quantite_requise' => $mat['quantite_requise'] ?? 1];
            }
            $produit->materiels()->sync($syncData);
        }

        CacheService::forget('produits:all');

        return response()->json([
            'message' => 'Produit mis à jour avec succès',
            'produit' => new ProduitResource($produit->load('materiels'))
        ]);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);
        $produit->delete();
        
        CacheService::forget('produits:all');
        
        return response()->json(['message' => 'Produit supprimé']);
    }
}
