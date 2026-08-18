<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tache;

class TacheController extends Controller
{
    public function index(Request $request)
    {
        $query = Tache::with(['employe.user']);

        // Filtrage par statut
        if ($request->has('statut') && $request->statut !== 'tous') {
            $query->where('statut', $request->statut);
        }

        // Filtrage par priorité
        if ($request->has('priorite') && $request->priorite !== 'toutes') {
            $query->where('priorite', $request->priorite);
        }

        // Recherche par titre
        if ($request->has('search') && $request->search) {
            $query->where('titre', 'like', '%' . $request->search . '%');
        }

        // Filtrage par mois (pour le calendrier)
        if ($request->has('mois') && $request->has('annee')) {
            $query->whereMonth('date_echeance', $request->mois)
                  ->whereYear('date_echeance', $request->annee);
        }

        $taches = $query->orderBy('date_echeance', 'asc')->orderBy('priorite', 'desc')->get();

        return response()->json(['data' => $taches]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'employe_id' => 'nullable|exists:employes,id',
            'priorite' => 'required|in:basse,moyenne,haute,urgente',
            'statut' => 'required|in:a_faire,en_cours,termine',
            'date_echeance' => 'nullable|date',
            'couleur' => 'nullable|string|max:20',
        ]);

        $tache = Tache::create($request->all());

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'data' => $tache->load('employe.user')
        ], 201);
    }

    public function show($id)
    {
        $tache = Tache::with(['employe.user'])->findOrFail($id);
        return response()->json(['data' => $tache]);
    }

    public function update(Request $request, $id)
    {
        $tache = Tache::findOrFail($id);

        $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'employe_id' => 'nullable|exists:employes,id',
            'priorite' => 'sometimes|required|in:basse,moyenne,haute,urgente',
            'statut' => 'sometimes|required|in:a_faire,en_cours,termine',
            'date_echeance' => 'nullable|date',
            'couleur' => 'nullable|string|max:20',
        ]);

        $tache->update($request->all());

        return response()->json([
            'message' => 'Tâche mise à jour avec succès',
            'data' => $tache->load('employe.user')
        ]);
    }

    public function destroy($id)
    {
        $tache = Tache::findOrFail($id);
        $tache->delete();

        return response()->json(['message' => 'Tâche supprimée avec succès']);
    }

    public function updateStatut(Request $request, $id)
    {
        $tache = Tache::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:a_faire,en_cours,termine',
        ]);

        $tache->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'data' => $tache->load('employe.user')
        ]);
    }
}
