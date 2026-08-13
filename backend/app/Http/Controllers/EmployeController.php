<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employe;
use App\Models\User;

class EmployeController extends Controller
{
    public function index()
    {
        $employes = Employe::with(['user'])->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $employes]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'type_employe' => 'required|in:gestionnaire,infirmier_soins,infirmier_garde',
            'mode_remuneration' => 'required|in:salarie,par_acte',
            'salaire_base' => 'nullable|numeric|min:0',
            'tarif_acte' => 'nullable|numeric|min:0',
            'cin' => 'nullable|string',
            'telephone' => 'nullable|string',
            'date_embauche' => 'nullable|date',
            'statut' => 'required|in:actif,inactif,en_conge',
        ]);

        $matricule = 'EMP-' . str_pad(Employe::max('id') + 1, 4, '0', STR_PAD_LEFT);

        $employe = Employe::create([
            'user_id' => $request->user_id,
            'matricule' => $matricule,
            'type_employe' => $request->type_employe,
            'mode_remuneration' => $request->mode_remuneration,
            'salaire_base' => $request->salaire_base ?? 0,
            'tarif_acte' => $request->tarif_acte ?? 0,
            'cin' => $request->cin,
            'telephone' => $request->telephone,
            'date_embauche' => $request->date_embauche ?? now()->toDateString(),
            'statut' => $request->statut,
        ]);

        return response()->json([
            'message' => 'Fiche employé créée avec succès',
            'data' => $employe->load('user')
        ], 201);
    }

    public function show($id)
    {
        $employe = Employe::with(['user', 'presences', 'conges', 'fichesPaie'])->findOrFail($id);
        return response()->json(['data' => $employe]);
    }

    public function update(Request $request, $id)
    {
        $employe = Employe::findOrFail($id);

        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'type_employe' => 'required|in:gestionnaire,infirmier_soins,infirmier_garde',
            'mode_remuneration' => 'required|in:salarie,par_acte',
            'salaire_base' => 'nullable|numeric|min:0',
            'tarif_acte' => 'nullable|numeric|min:0',
            'cin' => 'nullable|string',
            'telephone' => 'nullable|string',
            'date_embauche' => 'nullable|date',
            'statut' => 'required|in:actif,inactif,en_conge',
        ]);

        $employe->update($request->all());

        return response()->json([
            'message' => 'Fiche employé mise à jour',
            'data' => $employe->load('user')
        ]);
    }

    public function destroy($id)
    {
        $employe = Employe::findOrFail($id);
        $employe->delete();

        return response()->json(['message' => 'Employé supprimé avec succès']);
    }
}