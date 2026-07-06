<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    public function index()
    {
        return response()->json(Fournisseur::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string',
            'entreprise' => 'nullable|string|max:255',
        ]);
        $item = Fournisseur::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Fournisseur::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Fournisseur::findOrFail($id);
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string',
            'entreprise' => 'nullable|string|max:255',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Fournisseur::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}