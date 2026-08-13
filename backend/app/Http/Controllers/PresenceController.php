<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Presence;

class PresenceController extends Controller
{
    public function index()
    {
        $presences = Presence::with(['employe.user'])->orderBy('date', 'desc')->get();
        return response()->json(['data' => $presences]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'date' => 'required|date',
            'heure_arrivee' => 'nullable',
            'heure_depart' => 'nullable',
            'statut' => 'required|in:present,absent,retard,demi_journee',
            'notes' => 'nullable|string',
        ]);

        $presence = Presence::updateOrCreate(
            ['employe_id' => $request->employe_id, 'date' => $request->date],
            [
                'heure_arrivee' => $request->heure_arrivee,
                'heure_depart' => $request->heure_depart,
                'statut' => $request->statut,
                'notes' => $request->notes,
            ]
        );

        return response()->json([
            'message' => 'Présence enregistrée avec succès',
            'data' => $presence->load('employe.user')
        ], 201);
    }

    public function destroy($id)
    {
        $presence = Presence::findOrFail($id);
        $presence->delete();

        return response()->json(['message' => 'Enregistrement de présence supprimé']);
    }
}