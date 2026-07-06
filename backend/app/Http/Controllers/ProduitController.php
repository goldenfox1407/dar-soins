<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Http\Resources\ProduitResource;
use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\UpdateProduitRequest;
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
    public function store(StoreProduitRequest $request)
    {

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
    public function update(UpdateProduitRequest $request, $id)
    {
        $produit = Produit::findOrFail($id);

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
