<?php

namespace App\Http\Controllers;

use App\Models\Entrepot;
use Illuminate\Http\Request;

class EntrepotController extends Controller
{
    public function index()
    {
        return response()->json(Entrepot::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'est_principal' => 'nullable|boolean',
        ]);
        $item = Entrepot::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Entrepot::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Entrepot::findOrFail($id);
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'est_principal' => 'nullable|boolean',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Entrepot::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}