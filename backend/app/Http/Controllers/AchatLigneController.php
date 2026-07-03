<?php

namespace App\Http\Controllers;

use App\Models\AchatLigne;
use Illuminate\Http\Request;

class AchatLigneController extends Controller
{
    public function index()
    {
        return response()->json(AchatLigne::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'achat_id' => 'required|exists:achats,id',
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'cout_unitaire' => 'required|numeric|min:0',
            'sous_total' => 'required|numeric|min:0',
        ]);
        $item = AchatLigne::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(AchatLigne::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = AchatLigne::findOrFail($id);
        $request->validate([
            'achat_id' => 'sometimes|required|exists:achats,id',
            'produit_id' => 'sometimes|required|exists:produits,id',
            'quantite' => 'sometimes|required|integer|min:1',
            'cout_unitaire' => 'sometimes|required|numeric|min:0',
            'sous_total' => 'sometimes|required|numeric|min:0',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        AchatLigne::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}