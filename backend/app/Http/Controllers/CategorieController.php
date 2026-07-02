<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index()
    {
        return response()->json(Categorie::all());
    }

    public function store(Request $request)
    {
        $item = Categorie::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Categorie::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Categorie::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Categorie::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}