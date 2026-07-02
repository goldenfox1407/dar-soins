<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProduitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'description' => $this->description,
            'type' => $this->type,
            'prix_client' => $this->prix_client,
            'remuneration_soignant' => $this->remuneration_soignant,
            'type_remise' => $this->type_remise,
            'valeur_remise' => $this->valeur_remise,
            'image' => $this->image,
            'code_barres' => $this->code_barres,
            'materiels' => MaterielResource::collection($this->whenLoaded('materiels')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}