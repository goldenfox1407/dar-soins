<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use Illuminate\Http\Request;

class AchatController extends Controller
{
    public function index()
    {
        return response()->json(Achat::with(['fournisseur', 'entrepot'])->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|unique:achats,reference|max:255',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'entrepot_id' => 'required|exists:entrepots,id',
            'statut' => 'required|in:Recu,En attente,Commande',
            'statut_paiement' => 'required|in:Paye,Partiel,Non paye',
            'montant_total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);
        $item = Achat::create($request->all());
        return response()->json($item->load(['fournisseur', 'entrepot']), 201);
    }

    public function show($id)
    {
        return response()->json(Achat::with(['fournisseur', 'entrepot'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Achat::findOrFail($id);
        $request->validate([
            'reference' => 'sometimes|required|string|unique:achats,reference,' . $id . '|max:255',
            'fournisseur_id' => 'sometimes|required|exists:fournisseurs,id',
            'entrepot_id' => 'sometimes|required|exists:entrepots,id',
            'statut' => 'sometimes|required|in:Recu,En attente,Commande',
            'statut_paiement' => 'sometimes|required|in:Paye,Partiel,Non paye',
            'montant_total' => 'sometimes|required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);
        $item->update($request->all());
        return response()->json($item->load(['fournisseur', 'entrepot']));
    }

    public function destroy($id)
    {
        Achat::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}