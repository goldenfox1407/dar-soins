<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;

class EmployeController extends Controller
{
    public function index()
    {
        return response()->json(Employe::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'nom' => 'required|string|max:255',
            'departement' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'salaire_base' => 'required|numeric|min:0',
            'date_embauche' => 'required|date',
        ]);
        $item = Employe::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Employe::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Employe::findOrFail($id);
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'nom' => 'sometimes|required|string|max:255',
            'departement' => 'sometimes|required|string|max:255',
            'designation' => 'sometimes|required|string|max:255',
            'salaire_base' => 'sometimes|required|numeric|min:0',
            'date_embauche' => 'sometimes|required|date',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Employe::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}