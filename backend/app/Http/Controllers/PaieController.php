<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FichePaie;
use App\Models\Employe;

class PaieController extends Controller
{
    public function index()
    {
        $fiches = FichePaie::with(['employe.user'])->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $fiches]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'mois_annee' => 'required|string', // Format: YYYY-MM
            'salaire_base' => 'nullable|numeric|min:0',
            'commissions_actes' => 'nullable|numeric|min:0',
            'primes' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'statut_paiement' => 'required|in:paye,en_attente',
            'date_paiement' => 'nullable|date',
        ]);

        $employe = Employe::findOrFail($request->employe_id);

        $salaireBase = $request->salaire_base ?? $employe->salaire_base;
        $commissionsActes = $request->commissions_actes ?? 0;
        $primes = $request->primes ?? 0;
        $deductions = $request->deductions ?? 0;

        $salaireNet = ($salaireBase + $commissionsActes + $primes) - $deductions;

        $reference = 'PAY-' . str_replace('-', '', $request->mois_annee) . '-' . str_pad($employe->id, 4, '0', STR_PAD_LEFT);

        $fiche = FichePaie::create([
            'employe_id' => $employe->id,
            'reference' => $reference,
            'mois_annee' => $request->mois_annee,
            'salaire_base' => $salaireBase,
            'commissions_actes' => $commissionsActes,
            'primes' => $primes,
            'deductions' => $deductions,
            'salaire_net' => max(0, $salaireNet),
            'statut_paiement' => $request->statut_paiement,
            'date_paiement' => $request->statut_paiement === 'paye' ? ($request->date_paiement ?? now()->toDateString()) : null,
        ]);

        return response()->json([
            'message' => 'Fiche de paie générée avec succès',
            'data' => $fiche->load('employe.user')
        ], 201);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut_paiement' => 'required|in:paye,en_attente'
        ]);

        $fiche = FichePaie::findOrFail($id);
        $fiche->update([
            'statut_paiement' => $request->statut_paiement,
            'date_paiement' => $request->statut_paiement === 'paye' ? now()->toDateString() : null,
        ]);

        return response()->json([
            'message' => 'Statut de la fiche de paie mis à jour',
            'data' => $fiche->load('employe.user')
        ]);
    }

    public function destroy($id)
    {
        $fiche = FichePaie::findOrFail($id);
        $fiche->delete();

        return response()->json(['message' => 'Fiche de paie supprimée avec succès']);
    }
}
