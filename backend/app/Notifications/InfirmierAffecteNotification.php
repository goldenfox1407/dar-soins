<?php

namespace App\Notifications;

class InfirmierAffecteNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $id = $this->payload?->id ?? '?';

        return "Intervention #{$id} - Vous êtes affecté(e)";
    }

    public function getMessage(): string
    {
        $intervention = $this->payload;
        if (! $intervention) {
            return 'Une intervention vous a été assignée.';
        }

        $client = $intervention->client?->user;
        $date = $intervention->date_heure?->format('d/m/Y H:i');

        return sprintf(
            'Vous avez été affecté(e) à une intervention pour %s %s prévue le %s.',
            $client?->prenom ?? '',
            $client?->nom ?? 'patient',
            $date ?? 'à définir'
        );
    }

    public function getIcone(): string
    {
        return 'user-check';
    }

    public function getCouleur(): string
    {
        return '#8B5CF6'; // violet-500
    }

    public function getUrlCible(): ?string
    {
        if ($this->payload) {
            return "/infirmier/interventions/{$this->payload->id}";
        }

        return parent::getUrlCible();
    }
}
