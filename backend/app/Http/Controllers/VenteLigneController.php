<?php

namespace App\Http\Controllers;

use App\Models\VenteLigne;
use Illuminate\Http\Request;

class VenteLigneController extends Controller
{
    public function index()
    {
        return response()->json(VenteLigne::all());
    }

    public function store(Request $request)
    {
        $item = VenteLigne::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(VenteLigne::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = VenteLigne::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        VenteLigne::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}