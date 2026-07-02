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
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        TransactionFinanciere::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}