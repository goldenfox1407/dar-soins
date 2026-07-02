<?php

namespace App\Http\Controllers;

use App\Models\CompteBancaire;
use Illuminate\Http\Request;

class CompteBancaireController extends Controller
{
    public function index()
    {
        return response()->json(CompteBancaire::all());
    }

    public function store(Request $request)
    {
        $item = CompteBancaire::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(CompteBancaire::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = CompteBancaire::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        CompteBancaire::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}