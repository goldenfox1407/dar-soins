<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TacheResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'reference'         => $this->reference,
            'titre'             => $this->titre,
            'description'       => $this->description,
            'statut'            => $this->statut,
            'statut_label'      => TacheResource::statutLabel($this->statut),
            'priorite'          => $this->priorite,
            'priorite_label'    => TacheResource::prioriteLabel($this->priorite),
            'categorie'         => $this->categorie,
            'categorie_label'   => TacheResource::categorieLabel($this->categorie),
            'couleur_statut'    => $this->couleurStatut(),
            'assigne_a'         => $this->assigne_a,
            'assigne'           => $this->whenLoaded('assigne', fn() => [
                'id'         => $this->assigne->id,
                'nom'        => $this->assigne->nom,
                'prenom'     => $this->assigne->prenom,
                'nom_complet'=> $this->assigne->nom_complet ?? trim(($this->assigne->prenom ?? '').' '.$this->assigne->nom),
                'role'       => $this->assigne->role,
            ]),
            'cree_par'          => $this->cree_par,
            'createur'          => $this->whenLoaded('createur', fn() => [
                'id'         => $this->createur->id,
                'nom_complet'=> trim(($this->createur->prenom ?? '').' '.$this->createur->nom),
                'role'       => $this->createur->role,
            ]),
            'echeance'          => $this->echeance?->toDateString(),
            'date_debut'        => $this->date_debut?->toISOString(),
            'date_cloture'      => $this->date_cloture?->toISOString(),
            'intervention_id'   => $this->intervention_id,
            'intervention'      => $this->whenLoaded('intervention', fn() => [
                'id'     => $this->intervention->id,
                'statut' => $this->intervention->statut,
            ]),
            'tags'              => $this->tags ?? [],
            'progression'       => $this->progression,
            'est_en_retard'     => $this->estEnRetard(),
            'created_at'        => $this->created_at?->toISOString(),
            'updated_at'        => $this->updated_at?->toISOString(),
        ];
    }

    public static function statutLabel(string $statut): string
    {
        return \App\Models\Tache::statuts()[$statut] ?? $statut;
    }

    public static function prioriteLabel(string $priorite): string
    {
        return \App\Models\Tache::priorites()[$priorite] ?? $priorite;
    }

    public static function categorieLabel(string $categorie): string
    {
        return \App\Models\Tache::categories()[$categorie] ?? $categorie;
    }
}
