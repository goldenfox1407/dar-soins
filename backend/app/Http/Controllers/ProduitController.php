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
            return ProduitResource::collection(Produit::all());
        });

        return response()->json($produits);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $produit = Produit::findOrFail($id);
        return response()->json(['data' => new ProduitResource($produit)]);
    }


    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProduitRequest $request)
    {
        $data = $request->except(['image']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $data['image'] = $path;
        }

        $produit = Produit::create($data);

        CacheService::forget('produits:all');

        return response()->json([
            'message' => 'Produit créé avec succès',
            'produit' => new ProduitResource($produit)
        ], 201);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProduitRequest $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $data = $request->except(['image']);
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $data['image'] = $path;
        }

        $produit->update($data);

        CacheService::forget('produits:all');

        return response()->json([
            'message' => 'Produit mis à jour avec succès',
            'produit' => new ProduitResource($produit)
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
