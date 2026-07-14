<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class FactureController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = Facture::with('intervention.client.user', 'intervention.infirmier.user', 'intervention.produit');

        if ($user->hasRole('client')) {
            $query->whereHas('intervention', fn($q) => $q->where('client_id', $user->client->id));
        } elseif ($user->hasRole('infirmier')) {
            $query->whereHas('intervention', fn($q) => $q->where('infirmier_id', $user->infirmier->id));
        }
        // gestionnaire : aucun filtre, accès total

        return response()->json($query->paginate(15));
    }

    /**
     * Générer le PDF de la facture (U.S8)
     */
    public function genererPdf($id)
    {
        $user = Auth::user();
        $facture = Facture::with(
            'intervention.client.user',
            'intervention.infirmier.user',
            'intervention.produit',
            'intervention.consommations.produit'
        )->findOrFail($id);

        $intervention = $facture->intervention;

        if ($user->hasRole('client') && $intervention->client->user_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($user->hasRole('infirmier') && $intervention->infirmier_id !== $user->infirmier->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $config = Config::firstOrFail();
        $pdf = Pdf::loadView('factures.pdf', compact('facture', 'intervention', 'config'));
        return $pdf->download('facture_' . $facture->reference . '.pdf');
    }
}
