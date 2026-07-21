<?php

namespace Database\Seeders;

use App\Models\Intervention;
use App\Models\User;
use App\Notifications\InterventionClotureeNotification;
use App\Notifications\NouveauClientNotification;
use App\Notifications\NouvelleInterventionNotification;
use App\Notifications\StockAlerteNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $gestionnaires = User::where('role', 'gestionnaire')->get();
        if ($gestionnaires->isEmpty()) {
            return;
        }

        $infirmiers = User::where('role', 'infirmier')->get();
        $clients = User::where('role', 'client')->get();

        // Notifications de démo pour le premier gestionnaire
        $gestionnaire = $gestionnaires->first();

        // 1. Nouvelle intervention
        $intervention = Intervention::latest()->first();
        if ($intervention) {
            $gestionnaire->notify(new NouvelleInterventionNotification(
                $intervention, 'nouvelle_intervention', null, [
                    'url_cible' => "/gestionnaire/interventions/{$intervention->id}",
                ]
            ));
        }

        // 2. Nouveau client
        if ($clients->isNotEmpty()) {
            $client = $clients->first();
            $gestionnaire->notify(new NouveauClientNotification(
                $client, 'nouveau_client', null, [
                    'url_cible' => "/gestionnaire/clients",
                ]
            ));
        }

        // 3. Stock alerte
        $gestionnaire->notify(new StockAlerteNotification(
            [
                'produit'  => ['id' => 1, 'nom' => 'Compresses stériles'],
                'quantite' => 12,
                'seuil'    => 20,
            ],
            'stock_alerte', null, []
        ));

        // 4. Intervention clôturée
        $interventionTerminee = Intervention::where('statut', 'terminee')->latest()->first();
        if ($interventionTerminee) {
            $gestionnaire->notify(new InterventionClotureeNotification(
                $interventionTerminee, 'intervention_cloturee', null, [
                    'url_cible' => "/gestionnaire/interventions/{$interventionTerminee->id}",
                    'role'      => 'gestionnaire',
                ]
            ));

            // Aussi au client concerné
            $clientUser = $interventionTerminee->client?->user;
            if ($clientUser) {
                $clientUser->notify(new InterventionClotureeNotification(
                    $interventionTerminee, 'intervention_cloturee', null, [
                        'url_cible' => "/client/interventions/{$interventionTerminee->id}",
                        'role'      => 'client',
                    ]
                ));
            }
        }

        // 5. Notifications d'il y a quelques jours (pour tester le "il y a")
        $oldNotifs = $gestionnaire->notifications()->take(3)->get();
        foreach ($oldNotifs as $notif) {
            $notif->update(['created_at' => now()->subDays(rand(2, 7))]);
        }
    }
}
