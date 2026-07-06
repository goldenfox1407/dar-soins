<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use Illuminate\Http\Request;

class DevisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $devis = Devis::with(['intervention.client.user', 'intervention.produit'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        return response()->json($devis);
    }

    public function telechargerPdf($id)
    {
        $devis = Devis::with(['intervention.client.user', 'intervention.produit', 'intervention.localisation'])->findOrFail($id);
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.devis', ['intervention' => $devis->intervention, 'devis' => $devis]);
        return $pdf->download('devis_'.$devis->id.'.pdf');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
