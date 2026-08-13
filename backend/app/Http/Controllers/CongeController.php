<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conge;

class CongeController extends Controller
{
    public function index()
    {
        $conges = Conge::with(['employe.user'])->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $conges]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'type_conge' => 'required|in:paye,maladie,sans_solde,maternite',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'nombre_jours' => 'required|integer|min:1',
            'motif' => 'nullable|string',
        ]);

        $conge = Conge::create([
            'employe_id' => $request->employe_id,
            'type_conge' => $request->type_conge,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'nombre_jours' => $request->nombre_jours,
            'statut' => 'en_attente',
            'motif' => $request->motif,
        ]);

        return response()->json([
            'message' => 'Demande de congé enregistrée',
            'data' => $conge->load('employe.user')
        ], 201);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:en_attente,approuve,refuse'
        ]);

        $conge = Conge::findOrFail($id);
        $conge->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut du congé mis à jour',
            'data' => $conge->load('employe.user')
        ]);
    }

    public function destroy($id)
    {
        $conge = Conge::findOrFail($id);
        $conge->delete();

        return response()->json(['message' => 'Demande de congé supprimée']);
    }
}
