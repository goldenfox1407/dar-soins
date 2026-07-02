<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use Illuminate\Http\Request;

class AchatController extends Controller
{
    public function index()
    {
        return response()->json(Achat::with(['fournisseur', 'entrepot'])->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $item = Achat::create($request->all());
        return response()->json($item->load(['fournisseur', 'entrepot']), 201);
    }

    public function show($id)
    {
        return response()->json(Achat::with(['fournisseur', 'entrepot'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Achat::findOrFail($id);
        $item->update($request->all());
        return response()->json($item->load(['fournisseur', 'entrepot']));
    }

    public function destroy($id)
    {
        Achat::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}