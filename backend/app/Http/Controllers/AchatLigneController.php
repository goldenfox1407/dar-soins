<?php

namespace App\Http\Controllers;

use App\Models\AchatLigne;
use Illuminate\Http\Request;

class AchatLigneController extends Controller
{
    public function index()
    {
        return response()->json(AchatLigne::all());
    }

    public function store(Request $request)
    {
        $item = AchatLigne::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(AchatLigne::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = AchatLigne::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        AchatLigne::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}