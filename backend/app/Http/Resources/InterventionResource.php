<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterventionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'statut' => $this->statut,
            'type' => $this->type,
            'duree_heures' => $this->duree_heures,
            'date_heure' => $this->date_heure,
            'client' => $this->whenLoaded('client', function () {
                return new UserResource($this->client->user);
            }),
            'infirmier' => $this->whenLoaded('infirmier', function () {
                return new UserResource($this->infirmier->user);
            }),
            'produit' => new ProduitResource($this->whenLoaded('produit')),
            'localisation' => $this->localisation,
            'facture' => new FactureResource($this->whenLoaded('facture')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}