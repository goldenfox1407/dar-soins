<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FactureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'montant_total' => $this->montant_total,
            'date_emission' => $this->date_emission?->toISOString(),
            'chemin_pdf' => $this->chemin_pdf,
            'intervention' => new InterventionResource($this->whenLoaded('intervention')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}