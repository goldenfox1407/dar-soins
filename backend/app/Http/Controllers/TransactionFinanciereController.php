<?php

namespace App\Http\Controllers;

use App\Models\TransactionFinanciere;
use Illuminate\Http\Request;

class TransactionFinanciereController extends Controller
{
    public function index()
    {
        return response()->json(TransactionFinanciere::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'compte_id' => 'required|exists:compte_bancaires,id',
            'type' => 'required|in:entree,sortie',
            'montant' => 'required|numeric|min:0',
            'date_transaction' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);
        $item = TransactionFinanciere::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(TransactionFinanciere::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = TransactionFinanciere::findOrFail($id);
        $request->validate([
            'compte_id' => 'sometimes|required|exists:compte_bancaires,id',
            'type' => 'sometimes|required|in:entree,sortie',
            'montant' => 'sometimes|required|numeric|min:0',
            'date_transaction' => 'sometimes|required|date',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        TransactionFinanciere::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}