<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employe;
use App\Models\Presence;
use App\Models\Conge;
use App\Models\FichePaie;
use App\Models\User;

class HrmSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'gestionnaire')->first();
        $infirmier = User::where('role', 'infirmier')->first();

        // 1. Create Employees
        if ($admin && Employe::where('user_id', $admin->id)->count() === 0) {
            Employe::create([
                'user_id' => $admin->id,
                'matricule' => 'EMP-0001',
                'type_employe' => 'gestionnaire',
                'mode_remuneration' => 'salarie',
                'salaire_base' => 7500.00,
                'tarif_acte' => 0.00,
                'cin' => 'AB123456',
                'telephone' => '+212 600 112 233',
                'date_embauche' => '2025-01-15',
                'statut' => 'actif',
            ]);
        }

        if ($infirmier && Employe::where('user_id', $infirmier->id)->count() === 0) {
            $empInf = Employe::create([
                'user_id' => $infirmier->id,
                'matricule' => 'EMP-0002',
                'type_employe' => 'infirmier_soins',
                'mode_remuneration' => 'par_acte',
                'salaire_base' => 0.00,
                'tarif_acte' => 150.00,
                'cin' => 'CD789012',
                'telephone' => '+212 611 223 344',
                'date_embauche' => '2025-03-01',
                'statut' => 'actif',
            ]);

            // Sample Presence
            Presence::create([
                'employe_id' => $empInf->id,
                'date' => now()->toDateString(),
                'heure_arrivee' => '08:30:00',
                'heure_depart' => '17:00:00',
                'statut' => 'present',
                'notes' => 'Garde de soins à domicile effectuée',
            ]);

            // Sample Conge
            Conge::create([
                'employe_id' => $empInf->id,
                'type_conge' => 'paye',
                'date_debut' => now()->addDays(5)->toDateString(),
                'date_fin' => now()->addDays(8)->toDateString(),
                'nombre_jours' => 3,
                'statut' => 'approuve',
                'motif' => 'Congé annuel',
            ]);

            // Sample Fiche de Paie
            FichePaie::create([
                'employe_id' => $empInf->id,
                'reference' => 'PAY-202608-0002',
                'mois_annee' => '2026-08',
                'salaire_base' => 0.00,
                'commissions_actes' => 4500.00, // 30 actes * 150 MAD
                'primes' => 500.00,
                'deductions' => 0.00,
                'salaire_net' => 5000.00,
                'statut_paiement' => 'paye',
                'date_paiement' => now()->toDateString(),
            ]);
        }

        // Additional Infirmier de Garde Salarié
        if (Employe::where('type_employe', 'infirmier_garde')->count() === 0) {
            Employe::create([
                'user_id' => null,
                'matricule' => 'EMP-0003',
                'type_employe' => 'infirmier_garde',
                'mode_remuneration' => 'salarie',
                'salaire_base' => 5500.00,
                'tarif_acte' => 0.00,
                'cin' => 'EF456789',
                'telephone' => '+212 622 334 455',
                'date_embauche' => '2025-06-10',
                'statut' => 'actif',
            ]);
        }
    }
}
