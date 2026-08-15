<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contrat;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\User;

class ContratSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'gestionnaire')->first();
        $client = Client::first();
        $infirmier = Infirmier::first();

        if ($client && Contrat::count() === 0) {
            // Contrat 1: Garde de Nuit Post-Opératoire
            Contrat::create([
                'reference' => 'CTR-2026-0001',
                'client_id' => $client->id,
                'infirmier_id' => $infirmier?->id,
                'type_garde' => 'nuit',
                'date_debut' => now()->toDateString(),
                'date_fin' => now()->addDays(7)->toDateString(),
                'horaires_garde' => '20h00 - 08h00',
                'tarif_journalier' => 450.00,
                'montant_total' => 3150.00, // 7 jours * 450 MAD
                'statut' => 'actif',
                'clauses_specifiques' => 'Assurer la surveillance nocturne post-opératoire, changement des pansements à 22h, administration des antalgiques selon prescription et prise des constantes toutes les 4h.',
                'prescriptions_medicales' => 'Paracétamol 1g à 22h et 06h. Surveillance du drain et de la tension artérielle.',
                'user_id' => $admin?->id,
            ]);

            // Contrat 2: Garde Continu 24h/24 Accompagnement Senior
            Contrat::create([
                'reference' => 'CTR-2026-0002',
                'client_id' => $client->id,
                'infirmier_id' => $infirmier?->id,
                'type_garde' => '24h',
                'date_debut' => now()->subDays(3)->toDateString(),
                'date_fin' => now()->addDays(10)->toDateString(),
                'horaires_garde' => '24h / 24 (Roulement 2 infirmiers)',
                'tarif_journalier' => 900.00,
                'montant_total' => 12600.00,
                'statut' => 'actif',
                'clauses_specifiques' => 'Assistance permanente pour patient dépendant, aide à la mobilité, toilette quotidienne, administration du traitement chronique et présence rassurante.',
                'prescriptions_medicales' => 'Insuline Basal à 08h. Contrôle de la glycémie capillaire avant chaque repas. Régime hyposodé.',
                'user_id' => $admin?->id,
            ]);
        }
    }
}
