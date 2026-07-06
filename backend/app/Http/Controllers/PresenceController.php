<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function index()
    {
        return response()->json(Presence::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'date' => 'required|date',
            'heure_entree' => 'nullable|date_format:H:i',
            'heure_sortie' => 'nullable|date_format:H:i',
            'statut' => 'required|in:present,absent,conge,retard',
        ]);
        $item = Presence::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Presence::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Presence::findOrFail($id);
        $request->validate([
            'employe_id' => 'sometimes|required|exists:employes,id',
            'date' => 'sometimes|required|date',
            'heure_entree' => 'nullable|date_format:H:i',
            'heure_sortie' => 'nullable|date_format:H:i',
            'statut' => 'sometimes|required|in:present,absent,conge,retard',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Presence::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}