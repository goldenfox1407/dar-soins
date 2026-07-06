<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\TransactionFinanciere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class AchatController extends Controller
{
    public function index()
    {
        return response()->json(Achat::with(['fournisseur', 'entrepot'])->orderBy('created_at', 'desc')->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|unique:achats,reference|max:255',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'entrepot_id' => 'required|exists:entrepots,id',
            'statut' => 'required|in:Recu,En attente,Commande',
            'statut_paiement' => 'required|in:Paye,Partiel,Non paye',
            'montant_total' => 'required|numeric|min:0',
            'order_tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'shipping' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|numeric|min:1',
            'lignes.*.cout_unitaire' => 'required|numeric|min:0',
            'lignes.*.discount' => 'nullable|numeric|min:0',
            'lignes.*.tax_percent' => 'nullable|numeric|min:0',
            'lignes.*.sous_total' => 'required|numeric|min:0',
        ]);

        $achat = Achat::create($request->except('lignes'));

        foreach ($request->lignes as $ligne) {
            $achat->lignes()->create($ligne);
        }

        return response()->json($achat->load(['fournisseur', 'entrepot', 'lignes']), 201);
    }

    public function show($id)
    {
        return response()->json(Achat::with(['fournisseur', 'entrepot', 'lignes.produit'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Achat::findOrFail($id);
        $request->validate([
            'reference' => 'sometimes|required|string|unique:achats,reference,' . $id . '|max:255',
            'fournisseur_id' => 'sometimes|required|exists:fournisseurs,id',
            'entrepot_id' => 'sometimes|required|exists:entrepots,id',
            'statut' => 'sometimes|required|in:Recu,En attente,Commande',
            'statut_paiement' => 'sometimes|required|in:Paye,Partiel,Non paye',
            'montant_total' => 'sometimes|required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);
        $item->update($request->all());
        return response()->json($item->load(['fournisseur', 'entrepot']));
    }

    public function destroy($id)
    {
        Achat::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    public function generatePDF($id)
    {
        $achat = Achat::with(['fournisseur', 'entrepot', 'lignes.produit'])->findOrFail($id);
        // We will create a simple view 'achats.pdf' later
        $pdf = Pdf::loadView('achats.pdf', compact('achat'));
        return $pdf->download('achat_' . $achat->reference . '.pdf');
    }

    public function printLabels($id)
    {
        $achat = Achat::with(['lignes.produit'])->findOrFail($id);
        $pdf = Pdf::loadView('achats.labels', compact('achat'));
        return $pdf->download('labels_' . $achat->reference . '.pdf');
    }

    public function uploadDocument(Request $request, $id)
    {
        $request->validate(['file' => 'required|file|max:10240']); // max 10MB
        $achat = Achat::findOrFail($id);
        
        $path = $request->file('file')->store('achats_documents', 'public');
        
        $docs = $achat->documents ?? [];
        $docs[] = [
            'name' => $request->file('file')->getClientOriginalName(),
            'path' => $path,
            'date' => now()->toDateTimeString()
        ];
        
        $achat->documents = $docs;
        $achat->save();
        
        return response()->json(['message' => 'Document uploadé', 'documents' => $achat->documents]);
    }

    public function sendNotification(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|in:email,sms,whatsapp',
            'message' => 'required|string'
        ]);
        
        $achat = Achat::with('fournisseur')->findOrFail($id);
        
        // Simulation d'envoi
        Log::info("Notification {$request->type} envoyée au fournisseur {$achat->fournisseur->nom}", [
            'achat_id' => $id,
            'message' => $request->message
        ]);
        
        return response()->json(['message' => 'Notification envoyée avec succès (simulé).']);
    }

    public function getPaiements($id)
    {
        $achat = Achat::findOrFail($id);
        // Fetch paiements from transactions_financieres with reference LIKE ACHAT_REF%
        $paiements = TransactionFinanciere::where('reference', 'LIKE', 'PAY_ACHAT_' . $achat->id . '%')->orderBy('created_at', 'desc')->get();
        return response()->json($paiements);
    }

    public function storePaiement(Request $request, $id)
    {
        $request->validate([
            'montant' => 'required|numeric|min:0.1',
            'date_transaction' => 'required|date',
            'type_paiement' => 'required|string',
            'compte_id' => 'required|exists:comptes_bancaires,id'
        ]);

        $achat = Achat::findOrFail($id);
        
        $paiement = TransactionFinanciere::create([
            'compte_id' => $request->compte_id,
            'type' => 'depense',
            'montant' => $request->montant,
            'date_transaction' => $request->date_transaction,
            'reference' => 'PAY_ACHAT_' . $achat->id . '_' . time(),
            'description' => 'Paiement pour l\'achat ' . $achat->reference . ' par ' . $request->type_paiement,
        ]);
        
        // Update statut paiement
        $totalPaiements = TransactionFinanciere::where('reference', 'LIKE', 'PAY_ACHAT_' . $achat->id . '%')->sum('montant');
        if ($totalPaiements >= $achat->montant_total) {
            $achat->statut_paiement = 'Paye';
        } else if ($totalPaiements > 0) {
            $achat->statut_paiement = 'Partiel';
        }
        $achat->save();

        return response()->json(['message' => 'Paiement ajouté', 'paiement' => $paiement, 'achat' => $achat]);
    }

    public function marquerRetourne($id)
    {
        $achat = Achat::findOrFail($id);
        $achat->statut = 'Retourné';
        $achat->save();
        
        // Annuler paiements ? (Optionnel)
        
        return response()->json(['message' => 'Achat marqué comme retourné.', 'achat' => $achat]);
    }
}