<?php

namespace App\Notifications;

class DevisAccepteNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $id = $this->payload?->intervention_id ?? $this->payload?->id ?? '?';

        return "Devis accepté - Intervention #{$id}";
    }

    public function getMessage(): string
    {
        $devis = $this->payload;
        if (! $devis) {
            return 'Un devis a été accepté par le client.';
        }

        $montant = number_format($devis->montant_estime + ($devis->frais_deplacement ?? 0), 2, ',', ' ');

        return sprintf(
            'Le client a accepté le devis d\'un montant de %s MAD. Vous pouvez procéder à l\'intervention.',
            $montant
        );
    }

    public function getIcone(): string
    {
        return 'check-circle';
    }

    public function getCouleur(): string
    {
        return '#10B981'; // emerald-500
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
