<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function index()
    {
        return response()->json(Presence::all());
    }

    public function store(Request $request)
    {
        $item = Presence::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Presence::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Presence::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Presence::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}