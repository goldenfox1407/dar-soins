<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use Illuminate\Http\Request;

class VenteController extends Controller
{
    public function index()
    {
        // Retourne toutes les interventions (ventes) pour le gestionnaire
        $ventes = Intervention::with(['client.user', 'produit', 'infirmier.user', 'devis', 'facture'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        return response()->json($ventes);
    }
}