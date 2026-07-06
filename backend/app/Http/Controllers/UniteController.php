<?php

namespace App\Http\Controllers;

use App\Models\Unite;
use Illuminate\Http\Request;

class UniteController extends Controller
{
    public function index()
    {
        return response()->json(Unite::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'nom_court' => 'required|string|max:10',
        ]);
        $item = Unite::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Unite::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Unite::findOrFail($id);
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'nom_court' => 'sometimes|required|string|max:10',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Unite::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}