<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Notifications\GenericSystemNotification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admins = User::where('role', 'gestionnaire')->get();

        foreach ($admins as $admin) {
            if ($admin->notifications()->count() === 0) {
                $admin->notify(new GenericSystemNotification(
                    'Nouvelle demande d\'intervention',
                    'Mme Amina Kabbaj a demandé un soin infirmier à domicile (Pansement complexe).',
                    'nouvelle_intervention',
                    '🏥',
                    '/gestionnaire/interventions'
                ));

                $admin->notify(new GenericSystemNotification(
                    'Alerte Stock Bas - Seringues 5ml',
                    'Le stock actuel de "Seringues 5ml" est de 12 unités (seuil minimal: 20).',
                    'stock_alerte',
                    '📦',
                    '/gestionnaire/produits'
                ));

                $admin->notify(new GenericSystemNotification(
                    'Devis Accepté par le client',
                    'Le devis #DEV-0042 a été accepté par M. Youssef Tazi.',
                    'devis_accepte',
                    '✅',
                    '/gestionnaire/devis'
                ));

                $admin->notify(new GenericSystemNotification(
                    'Nouveau client inscrit',
                    'M. Omar Benjelloun s\'est inscrit sur la plateforme.',
                    'nouveau_client',
                    '👤',
                    '/gestionnaire/gens/clients'
                ));
            }
        }
    }
}
