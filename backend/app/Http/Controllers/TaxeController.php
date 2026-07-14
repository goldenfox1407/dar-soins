<?php

namespace App\Http\Controllers;

use App\Models\Taxe;
use Illuminate\Http\Request;

class TaxeController extends Controller
{
    public function index()
    {
        return response()->json(Taxe::orderBy('taux')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:100',
            'taux'        => 'required|numeric|min:0|max:100',
            'type'        => 'sometimes|in:percent,fixed',
            'est_defaut'  => 'sometimes|boolean',
            'est_actif'   => 'sometimes|boolean',
            'description' => 'nullable|string',
        ]);

        if (!empty($data['est_defaut'])) {
            Taxe::where('est_defaut', true)->update(['est_defaut' => false]);
        }

        return response()->json(Taxe::create($data), 201);
    }

    public function update(Request $request, Taxe $taxe)
    {
        $data = $request->validate([
            'nom'         => 'sometimes|string|max:100',
            'taux'        => 'sometimes|numeric|min:0|max:100',
            'type'        => 'sometimes|in:percent,fixed',
            'est_defaut'  => 'sometimes|boolean',
            'est_actif'   => 'sometimes|boolean',
            'description' => 'nullable|string',
        ]);

        if (!empty($data['est_defaut'])) {
            Taxe::where('est_defaut', true)->where('id', '!=', $taxe->id)->update(['est_defaut' => false]);
        }

        $taxe->update($data);
        return response()->json($taxe);
    }

    public function destroy(Taxe $taxe)
    {
        if ($taxe->est_defaut) {
            return response()->json(['message' => 'Impossible de supprimer la taxe par défaut.'], 422);
        }
        $taxe->delete();
        return response()->json(['message' => 'Supprimé']);
    }
}
