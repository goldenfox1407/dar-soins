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
            'prix_achat' => $this->prix_achat,
            'remuneration_soignant' => $this->remuneration_soignant,
            'type_remise' => $this->type_remise,
            'valeur_remise' => $this->valeur_remise,
            'image' => $this->image,
            'code_barres' => $this->code_barres,
            'symbologie' => $this->symbologie,
            'stock_initial' => $this->stock_initial,
            'gerer_stock' => $this->gerer_stock,
            'quantite_alerte' => $this->quantite_alerte,
            'categorie_id' => $this->categorie_id,
            'marque_id' => $this->marque_id,
            'unite_id' => $this->unite_id,
            'quantite_stock' => $this->stock_initial, // Temporary simple mapping, can be replaced by calculated stock
            'materiels' => MaterielResource::collection($this->whenLoaded('materiels')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}