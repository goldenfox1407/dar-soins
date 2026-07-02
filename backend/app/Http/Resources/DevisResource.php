<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DevisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'montant_estime' => $this->montant_estime,
            'date' => $this->date?->toISOString(),
            'intervention' => new InterventionResource($this->whenLoaded('intervention')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}