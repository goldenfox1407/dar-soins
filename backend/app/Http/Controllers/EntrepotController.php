<?php

namespace App\Http\Controllers;

use App\Models\Entrepot;
use Illuminate\Http\Request;

class EntrepotController extends Controller
{
    public function index()
    {
        return response()->json(Entrepot::all());
    }

    public function store(Request $request)
    {
        $item = Entrepot::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Entrepot::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Entrepot::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Entrepot::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}