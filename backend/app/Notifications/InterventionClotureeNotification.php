<?php

namespace App\Notifications;

class InterventionClotureeNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $id = $this->payload?->id ?? '?';

        return "Intervention #{$id} clôturée";
    }

    public function getMessage(): string
    {
        $intervention = $this->payload;
        if (! $intervention) {
            return 'Une intervention vient d\'être clôturée.';
        }

        $infirmier = $intervention->infirmier?->user;
        $facture = $intervention->facture;

        if ($facture) {
            return sprintf(
                'L\'intervention réalisée par %s %s est terminée. Facture %s générée (%s MAD).',
                $infirmier?->prenom ?? '',
                $infirmier?->nom ?? 'infirmier',
                $facture->reference,
                number_format($facture->montant_total, 2, ',', ' ')
            );
        }

        return sprintf(
            'L\'intervention réalisée par %s %s est terminée.',
            $infirmier?->prenom ?? '',
            $infirmier?->nom ?? 'infirmier'
        );
    }

    public function getIcone(): string
    {
        return 'flag';
    }

    public function getCouleur(): string
    {
        return '#10B981'; // emerald-500
    }

    public function getUrlCible(): ?string
    {
        if ($this->payload) {
            $role = $this->options['role'] ?? 'gestionnaire';

            return "/{$role}/interventions/{$this->payload->id}";
        }

        return parent::getUrlCible();
    }
}
