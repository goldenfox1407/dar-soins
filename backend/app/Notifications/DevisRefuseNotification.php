<?php

namespace App\Notifications;

class DevisRefuseNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $id = $this->payload?->intervention_id ?? $this->payload?->id ?? '?';

        return "Devis refusé - Intervention #{$id}";
    }

    public function getMessage(): string
    {
        $devis = $this->payload;
        if (! $devis) {
            return 'Un devis a été refusé par le client.';
        }

        return 'Le client a refusé le devis. Une nouvelle proposition peut être nécessaire.';
    }

    public function getIcone(): string
    {
        return 'x-circle';
    }

    public function getCouleur(): string
    {
        return '#EF4444'; // red-500
    }

    public function getUrlCible(): ?string
    {
        $id = $this->payload?->intervention_id ?? $this->payload?->id;
        if ($id) {
            return "/gestionnaire/interventions/{$id}";
        }

        return parent::getUrlCible();
    }
}
