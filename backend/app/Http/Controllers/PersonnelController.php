<?php

namespace App\Http\Controllers;

use App\Models\Infirmier;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    /**
     * Get all personnel (Infirmiers) with their User info
     */
    public function index()
    {
        return response()->json(Infirmier::with('user', 'localisation')->get());
    }
}
