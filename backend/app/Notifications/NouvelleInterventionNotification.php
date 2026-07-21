<?php

namespace App\Notifications;

class NouvelleInterventionNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $id = $this->payload?->id ?? '?';

        return "Nouvelle demande d'intervention #{$id}";
    }

    public function getMessage(): string
    {
        $intervention = $this->payload;
        if (! $intervention) {
            return 'Une nouvelle demande a été enregistrée.';
        }

        $client = $intervention->client?->user;
        $date = $intervention->date_heure?->format('d/m/Y H:i');

        return sprintf(
            'Nouvelle demande de %s %s prévue le %s.',
            $client?->prenom ?? '',
            $client?->nom ?? 'client',
            $date ?? 'à définir'
        );
    }

    public function getIcone(): string
    {
        return 'stethoscope';
    }

    public function getCouleur(): string
    {
        return '#2563EB'; // blue-600
    }

    public function getUrlCible(): ?string
    {
        if ($this->payload) {
            return "/gestionnaire/interventions/{$this->payload->id}";
        }

        return parent::getUrlCible();
    }
}
