<?php

namespace App\Http\Controllers;

use App\Models\Devise;
use Illuminate\Http\Request;

class DeviseController extends Controller
{
    public function index()
    {
        return response()->json(Devise::orderBy('code')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'        => 'required|string|size:3|unique:devises,code',
            'nom'         => 'required|string|max:100',
            'symbole'     => 'required|string|max:5',
            'taux_change' => 'required|numeric|min:0.0001',
            'est_defaut'  => 'sometimes|boolean',
            'est_actif'   => 'sometimes|boolean',
        ]);

        $data['code'] = strtoupper($data['code']);

        if (!empty($data['est_defaut'])) {
            Devise::where('est_defaut', true)->update(['est_defaut' => false]);
        }

        return response()->json(Devise::create($data), 201);
    }

    public function update(Request $request, Devise $devise)
    {
        $data = $request->validate([
            'code'        => 'sometimes|string|size:3|unique:devises,code,' . $devise->id,
            'nom'         => 'sometimes|string|max:100',
            'symbole'     => 'sometimes|string|max:5',
            'taux_change' => 'sometimes|numeric|min:0.0001',
            'est_defaut'  => 'sometimes|boolean',
            'est_actif'   => 'sometimes|boolean',
        ]);

        if (!empty($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        if (!empty($data['est_defaut'])) {
            Devise::where('est_defaut', true)
                  ->where('id', '!=', $devise->id)
                  ->update(['est_defaut' => false]);
        }

        if ($devise->est_defaut) {
            if (isset($data['est_actif']) && !$data['est_actif']) {
                return response()->json(['message' => 'Impossible de desactiver la devise par defaut.'], 422);
            }
            if (isset($data['est_defaut']) && !$data['est_defaut']) {
                return response()->json(['message' => 'Definissez une autre devise par defaut avant de changer celle-ci.'], 422);
            }
        }

        $devise->update($data);
        return response()->json($devise);
    }

    public function destroy(Devise $devise)
    {
        if ($devise->est_defaut) {
            return response()->json(['message' => 'Impossible de supprimer la devise par defaut.'], 422);
        }

        if (strtoupper($devise->code) === 'MAD') {
            return response()->json(['message' => 'La devise MAD ne peut pas etre supprimee.'], 422);
        }

        $devise->delete();
        return response()->json(['message' => 'Devise supprimee.']);
    }
}
