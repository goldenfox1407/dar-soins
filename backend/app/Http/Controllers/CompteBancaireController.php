<?php

namespace App\Http\Controllers;

use App\Models\CompteBancaire;
use Illuminate\Http\Request;

class CompteBancaireController extends Controller
{
    public function index()
    {
        return response()->json(CompteBancaire::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom_compte' => 'required|string|max:255',
            'numero_compte' => 'required|string|max:50',
            'solde_initial' => 'required|numeric',
            'details' => 'nullable|string',
        ]);
        $item = CompteBancaire::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(CompteBancaire::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = CompteBancaire::findOrFail($id);
        $request->validate([
            'nom_compte' => 'sometimes|required|string|max:255',
            'numero_compte' => 'sometimes|required|string|max:50',
            'solde_initial' => 'sometimes|required|numeric',
            'details' => 'nullable|string',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        CompteBancaire::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}