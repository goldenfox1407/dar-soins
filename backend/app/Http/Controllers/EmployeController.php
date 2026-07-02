<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;

class EmployeController extends Controller
{
    public function index()
    {
        return response()->json(Employe::all());
    }

    public function store(Request $request)
    {
        $item = Employe::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Employe::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Employe::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Employe::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}