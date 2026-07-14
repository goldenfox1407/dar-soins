<?php

namespace Database\Seeders;

use App\Models\NotifConfig;
use Illuminate\Database\Seeder;

class NotifConfigSeeder extends Seeder
{
    public function run(): void
    {
        $evenements = [
            [
                'evenement'     => 'nouvelle_intervention',
                'label'         => 'Nouvelle demande d\'intervention',
                'icone'         => '🏥',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'devis_accepte',
                'label'         => 'Devis accepte par le client',
                'icone'         => '✅',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire', 'infirmier'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'devis_refuse',
                'label'         => 'Devis refuse par le client',
                'icone'         => '❌',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'intervention_cloturee',
                'label'         => 'Intervention cloturee',
                'icone'         => '🏁',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire', 'client'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'paiement_recu',
                'label'         => 'Paiement recu',
                'icone'         => '💰',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'stock_alerte',
                'label'         => 'Alerte stock bas',
                'icone'         => '📦',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'nouveau_client',
                'label'         => 'Nouveau client inscrit',
                'icone'         => '👤',
                'canal_email'   => false,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['gestionnaire'],
                'est_actif'     => true,
            ],
            [
                'evenement'     => 'infirmier_affecte',
                'label'         => 'Infirmier affecte a une intervention',
                'icone'         => '👨‍⚕️',
                'canal_email'   => true,
                'canal_sms'     => false,
                'canal_app'     => true,
                'destinataires' => ['infirmier', 'client'],
                'est_actif'     => true,
            ],
        ];

        foreach ($evenements as $item) {
            NotifConfig::updateOrCreate(
                ['evenement' => $item['evenement']],
                $item
            );
        }

        $this->command->info('NotifConfig: 8 evenements seedes avec succes.');
    }
}
