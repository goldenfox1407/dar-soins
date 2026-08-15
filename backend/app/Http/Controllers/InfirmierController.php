<?php

namespace App\Http\Controllers;

use App\Models\Infirmier;
use Illuminate\Http\Request;

class InfirmierController extends Controller
{
    public function index()
    {
        $infirmiers = Infirmier::with('user')->get();
        return response()->json(['data' => $infirmiers]);
    }

    public function show($id)
    {
        $infirmier = Infirmier::with('user')->findOrFail($id);
        return response()->json(['data' => $infirmier]);
    }
}
