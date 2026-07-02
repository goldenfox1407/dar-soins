<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use Illuminate\Http\Request;

class VenteController extends Controller
{
    public function index()
    {
        // Retourne toutes les interventions (ventes) pour le gestionnaire
        $ventes = Intervention::with(['client.user', 'produit', 'infirmier.user', 'devis'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($ventes);
    }
}