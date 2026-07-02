<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class FactureController extends Controller
{
    public function index()
    {
        return response()->json(Facture::with('intervention.client.user', 'intervention.infirmier.user', 'intervention.produit')->get());
    }

    /**
     * Générer le PDF de la facture (U.S8)
     */
    public function genererPdf($id)
    {
        $facture = Facture::with('intervention.client.user', 'intervention.infirmier.user', 'intervention.produit', 'intervention.consommations.produit')->findOrFail($id);
        $intervention = $facture->intervention;

        $pdf = Pdf::loadView('factures.pdf', compact('facture', 'intervention'));
        return $pdf->download('facture_'.$facture->reference.'.pdf');
    }
}
