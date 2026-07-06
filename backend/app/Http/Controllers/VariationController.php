<?php

namespace App\Http\Controllers;

use App\Models\Variation;
use Illuminate\Http\Request;

class VariationController extends Controller
{
    public function index()
    {
        return response()->json(Variation::paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'valeurs' => 'array'
        ]);
        $item = Variation::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Variation::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Variation::findOrFail($id);
        $request->validate([
            'nom' => 'string|max:255',
            'valeurs' => 'array'
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Variation::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
