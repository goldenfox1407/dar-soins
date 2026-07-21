<?php

namespace App\Notifications;

class NouveauClientNotification extends BaseNotification
{
    public function getTitre(): string
    {
        return 'Nouveau client inscrit';
    }

    public function getMessage(): string
    {
        $user = $this->payload;
        if (! $user) {
            return 'Un nouveau client vient de s\'inscrire.';
        }

        return sprintf(
            'Le client %s %s (%s) vient de créer un compte sur la plateforme.',
            $user->prenom ?? '',
            $user->nom ?? '',
            $user->email ?? ''
        );
    }

    public function getIcone(): string
    {
        return 'user-plus';
    }

    public function getCouleur(): string
    {
        return '#8B5CF6'; // violet-500
    }

    public function getUrlCible(): ?string
    {
        if ($this->payload?->client?->id) {
            return "/gestionnaire/clients/{$this->payload->client->id}";
        }

        return '/gestionnaire/clients';
    }
}
