<?php

namespace App\Http\Controllers;

use App\Models\UniteBase;
use Illuminate\Http\Request;

class UniteBaseController extends Controller
{
    public function index()
    {
        return response()->json(UniteBase::all());
    }

    public function store(Request $request)
    {
        $request->validate(['nom' => 'required|string|max:255']);
        $item = UniteBase::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(UniteBase::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = UniteBase::findOrFail($id);
        $request->validate(['nom' => 'string|max:255']);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        UniteBase::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
