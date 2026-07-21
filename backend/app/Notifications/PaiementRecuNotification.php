<?php

namespace App\Notifications;

class PaiementRecuNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $ref = $this->payload['reference'] ?? $this->payload?->reference ?? 'N/A';

        return "Paiement reçu - {$ref}";
    }

    public function getMessage(): string
    {
        $montant = $this->payload['montant'] ?? ($this->payload?->montant_total ?? $this->payload?->montant ?? 0);
        $methode = $this->payload['methode'] ?? ($this->payload?->methode_paiement ?? 'N/A');

        return sprintf(
            'Un paiement de %s MAD a été enregistré (méthode: %s).',
            number_format((float) $montant, 2, ',', ' '),
            $methode
        );
    }

    public function getIcone(): string
    {
        return 'wallet';
    }

    public function getCouleur(): string
    {
        return '#10B981'; // emerald-500
    }

    public function getUrlCible(): ?string
    {
        $type = $this->payload['type'] ?? 'achat';
        $id = $this->payload['id'] ?? ($this->payload?->id ?? null);

        if ($id) {
            return match ($type) {
                'intervention' => "/gestionnaire/interventions/{$id}",
                'achat'        => "/gestionnaire/achats/{$id}",
                'vente'        => "/gestionnaire/ventes/{$id}",
                default        => "/gestionnaire",
            };
        }

        return parent::getUrlCible();
    }
}
