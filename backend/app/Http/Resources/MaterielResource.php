<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterielResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'stock_actuel' => $this->stock_actuel,
            'prix_unitaire' => $this->prix_unitaire,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}