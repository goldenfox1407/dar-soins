<?php

namespace Database\Seeders;

use App\Models\Tache;
use App\Models\User;
use Illuminate\Database\Seeder;

class TacheSeeder extends Seeder
{
    public function run(): void
    {
        // Vérifie qu'on a au moins un gestionnaire
        $gestionnaire = User::where('role', 'gestionnaire')->first();
        if (! $gestionnaire) {
            return;
        }

        $infirmiers = User::where('role', 'infirmier')->get();
        if ($infirmiers->isEmpty()) {
            $infirmiers = collect([$gestionnaire]);
        }

        // Crée 25 tâches réalistes
        $taches = [
            ['titre' => 'Préparer planning de garde du weekend', 'categorie' => 'organisation', 'priorite' => 'haute', 'echeance' => now()->addDays(2)],
            ['titre' => 'Commander nouveau stock de compresses', 'categorie' => 'logistique', 'priorite' => 'urgente', 'echeance' => now()->addDay()],
            ['titre' => 'Former nouveau personnel infirmier', 'categorie' => 'rh', 'priorite' => 'normale', 'echeance' => now()->addWeek()],
            ['titre' => 'Vérifier certifications CIN infirmiers', 'categorie' => 'rh', 'priorite' => 'normale', 'echeance' => now()->addWeeks(2)],
            ['titre' => 'Réviser contrat partenariat clinique Atlas', 'categorie' => 'administratif', 'priorite' => 'haute', 'echeance' => now()->addDays(3)],
            ['titre' => 'Mettre à jour base clients inactifs', 'categorie' => 'administratif', 'priorite' => 'basse', 'echeance' => now()->addWeeks(3)],
            ['titre' => 'Inventaire mensuel entrepôt principal', 'categorie' => 'logistique', 'priorite' => 'haute', 'echeance' => now()->addDays(5)],
            ['titre' => 'Audit qualité des interventions de juin', 'categorie' => 'organisation', 'priorite' => 'normale', 'echeance' => now()->addWeek()],
            ['titre' => 'Renouveler assurance professionnelle', 'categorie' => 'administratif', 'priorite' => 'urgente', 'echeance' => now()->addDays(4)],
            ['titre' => 'Planifier maintenance véhicules équipe', 'categorie' => 'logistique', 'priorite' => 'normale', 'echeance' => now()->addWeeks(2)],
            ['titre' => 'Préparer rapport mensuel direction', 'categorie' => 'organisation', 'priorite' => 'haute', 'echeance' => now()->addDays(7)],
            ['titre' => 'Optimiser tournées infirmiers zone Rabat', 'categorie' => 'organisation', 'priorite' => 'normale', 'echeance' => now()->addWeeks(2)],
            ['titre' => 'Vérifier conformité RGPD données patients', 'categorie' => 'administratif', 'priorite' => 'haute', 'echeance' => now()->addWeeks(3)],
            ['titre' => 'Mettre en place système de rappel SMS', 'categorie' => 'organisation', 'priorite' => 'normale', 'echeance' => now()->addWeeks(2)],
            ['titre' => 'Recruter infirmier spécialisé pédiatrie', 'categorie' => 'rh', 'priorite' => 'urgente', 'echeance' => now()->addDays(10)],
        ];

        foreach ($taches as $data) {
            $statut = match (true) {
                $data['echeance']->isPast() => Tache::STATUT_TERMINEE,
                $data['echeance']->diffInDays(now()) < 3 => Tache::STATUT_EN_COURS,
                default => Tache::STATUT_A_FAIRE,
            };

            $progression = match ($statut) {
                Tache::STATUT_TERMINEE => 100,
                Tache::STATUT_EN_COURS => rand(20, 80),
                default => 0,
            };

            Tache::create([
                'reference'  => 'TACHE-'.date('Y').'-'.str_pad((string) (Tache::max('id') + 1), 4, '0', STR_PAD_LEFT),
                'titre'      => $data['titre'],
                'description'=> 'Tâche à réaliser : '.$data['titre'].'. Merci de respecter les délais.',
                'statut'     => $statut,
                'priorite'   => $data['priorite'],
                'categorie'  => $data['categorie'],
                'assigne_a'  => $infirmiers->random()->id,
                'cree_par'   => $gestionnaire->id,
                'echeance'   => $data['echeance'],
                'progression'=> $progression,
                'date_debut' => $statut === Tache::STATUT_EN_COURS ? now()->subDays(2) : null,
                'date_cloture' => $statut === Tache::STATUT_TERMINEE ? now()->subDay() : null,
            ]);
        }
    }
}
