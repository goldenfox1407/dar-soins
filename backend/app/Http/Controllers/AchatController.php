<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use Illuminate\Http\Request;

class AchatController extends Controller
{
    public function index()
    {
        return response()->json(Achat::all());
    }

    public function store(Request $request)
    {
        $item = Achat::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Achat::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Achat::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Achat::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}