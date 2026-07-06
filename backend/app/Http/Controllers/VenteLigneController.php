<?php

namespace App\Http\Controllers;

use App\Models\VenteLigne;
use Illuminate\Http\Request;

class VenteLigneController extends Controller
{
    public function index()
    {
        return response()->json(VenteLigne::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'vente_id' => 'required|exists:ventes,id',
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'prix_unitaire' => 'required|numeric|min:0',
            'sous_total' => 'required|numeric|min:0',
        ]);
        $item = VenteLigne::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(VenteLigne::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = VenteLigne::findOrFail($id);
        $request->validate([
            'vente_id' => 'sometimes|required|exists:ventes,id',
            'produit_id' => 'sometimes|required|exists:produits,id',
            'quantite' => 'sometimes|required|integer|min:1',
            'prix_unitaire' => 'sometimes|required|numeric|min:0',
            'sous_total' => 'sometimes|required|numeric|min:0',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        VenteLigne::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}