<?php

namespace App\Http\Controllers;

use App\Services\ServiceRapport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RapportController extends Controller
{
    public function __construct(protected ServiceRapport $service) {}

    public function synthese(Request $request): JsonResponse
    {
        $data = $this->service->synthese();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function stock(Request $request): JsonResponse
    {
        $data = $this->service->stock();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function ventes(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $data = $this->service->ventes($from, $to);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function achats(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $data = $this->service->achats($from, $to);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function interventions(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $data = $this->service->interventions($from, $to);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function finances(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $data = $this->service->finances($from, $to);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function iaSynthese(): JsonResponse
    {
        $data = $this->service->iaSynthese();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function iaAnomalies(): JsonResponse
    {
        $data = $this->service->iaAnomalies();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function iaPrevisions(): JsonResponse
    {
        $data = $this->service->iaPrevisions();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function iaRecommandations(): JsonResponse
    {
        $data = $this->service->iaRecommandations();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * Export CSV simple (à étendre avec maatwebsite/excel si besoin).
     */
    public function export(Request $request, string $type): JsonResponse
    {
        $allowed = ['synthese', 'stock', 'ventes', 'achats', 'interventions', 'finances'];

        if (! in_array($type, $allowed)) {
            return response()->json([
                'success' => false,
                'message' => 'Type de rapport invalide.',
            ], 400);
        }

        $data = match ($type) {
            'synthese'      => $this->service->synthese(),
            'stock'         => $this->service->stock(),
            'ventes'        => $this->service->ventes($request->get('from'), $request->get('to')),
            'achats'        => $this->service->achats($request->get('from'), $request->get('to')),
            'interventions' => $this->service->interventions($request->get('from'), $request->get('to')),
            'finances'      => $this->service->finances($request->get('from'), $request->get('to')),
        };

        // Pour l'instant, on retourne juste les données JSON.
        // Dans une vraie implémentation, on générerait un PDF ou CSV via maatwebsite/excel ou DomPDF.
        return response()->json([
            'success' => true,
            'type'    => $type,
            'data'    => $data,
            'message' => 'Export JSON généré. Pour PDF/Excel, configurez maatwebsite/excel.',
        ]);
    }
}
