<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request): array
    {
        $data = is_array($this->data) ? $this->data : (array) $this->data;

        return [
            'id'              => $this->id,
            'type'            => $this->type,
            'evenement'       => $this->evenement ?? $data['evenement'] ?? null,
            'titre'           => $data['titre'] ?? 'Notification',
            'message'         => $data['message'] ?? '',
            'icone'           => $this->icone ?? $data['icone'] ?? 'bell',
            'couleur'         => $this->couleur ?? $data['couleur'] ?? '#2563EB',
            'url_cible'       => $this->url_cible ?? $data['url_cible'] ?? null,
            'payload_id'      => $data['payload_id'] ?? null,
            'payload_type'    => $data['payload_type'] ?? null,
            'extra'           => $data['extra'] ?? [],
            'read_at'         => $this->read_at?->toISOString(),
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),
            'est_lue'         => ! is_null($this->read_at),
            'il_y_a'          => $this->created_at?->diffForHumans(),
        ];
    }
}
