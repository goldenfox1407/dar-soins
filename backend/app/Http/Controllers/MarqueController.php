<?php

namespace App\Http\Controllers;

use App\Models\Marque;
use Illuminate\Http\Request;

class MarqueController extends Controller
{
    public function index()
    {
        return response()->json(Marque::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $item = Marque::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Marque::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Marque::findOrFail($id);
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Marque::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}