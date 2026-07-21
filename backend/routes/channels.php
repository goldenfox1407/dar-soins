<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Canal privé par utilisateur : seul le user connecté peut écouter son propre canal
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privé des notifications Dar-Soins : un canal dédié par user
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal de présence des gestionnaires (admins) — pour les alertes globales temps réel
Broadcast::channel('presence.gestionnaires', function (User $user) {
    if (! $user->hasRole('gestionnaire')) {
        return false;
    }

    return ['id' => $user->id, 'name' => $user->nom.' '.$user->prenom];
});

// Canal de présence des infirmiers disponibles
Broadcast::channel('presence.infirmiers', function (User $user) {
    if (! $user->hasRole('infirmier')) {
        return false;
    }
    $infirmier = $user->infirmier;
    if (! $infirmier || ! $infirmier->est_disponible) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->nom.' '.$user->prenom,
        'specialite' => $infirmier->specialite,
    ];
});
