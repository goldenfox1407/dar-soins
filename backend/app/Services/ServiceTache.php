<?php

namespace App\Services;

use App\Models\Tache;
use App\Services\ServiceNumerotation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Service central pour la gestion des tâches d'organisation.
 * - Génération automatique de la référence TACHE-YYYY-XXXX
 * - Validation de la cohérence statut / progression / date_cloture
 */
class ServiceTache
{
    public function __construct(protected ServiceNumerotation $numerotation) {}

    /**
     * Crée une tâche avec sa référence auto-générée.
     */
    public function creer(array $data, int $userId): Tache
    {
        return DB::transaction(function () use ($data, $userId) {
            $data['reference'] = $this->genererReference();
            $data['cree_par']  = $userId;

            // Si statut terminée, on set date_cloture + progression 100
            if (($data['statut'] ?? null) === Tache::STATUT_TERMINEE) {
                $data['date_cloture'] = $data['date_cloture'] ?? now();
                $data['progression']  = 100;
            }

            // Si statut en cours et pas de date_debut, on la set
            if (($data['statut'] ?? null) === Tache::STATUT_EN_COURS && empty($data['date_debut'])) {
                $data['date_debut'] = now();
            }

            return Tache::create($data);
        });
    }

    /**
     * Met à jour une tâche en gérant les transitions de statut.
     */
    public function mettreAJour(Tache $tache, array $data): Tache
    {
        return DB::transaction(function () use ($tache, $data) {
            $ancienStatut = $tache->statut;
            $nouveauStatut = $data['statut'] ?? $ancienStatut;

            // Transition vers "en_cours"
            if ($nouveauStatut === Tache::STATUT_EN_COURS && $ancienStatut !== Tache::STATUT_EN_COURS) {
                $data['date_debut'] = $data['date_debut'] ?? $tache->date_debut ?? now();
            }

            // Transition vers "terminee"
            if ($nouveauStatut === Tache::STATUT_TERMINEE && $ancienStatut !== Tache::STATUT_TERMINEE) {
                $data['date_cloture'] = $data['date_cloture'] ?? now();
                $data['progression']  = 100;
            }

            // Transition vers "annulee"
            if ($nouveauStatut === Tache::STATUT_ANNULEE) {
                $data['progression'] = $data['progression'] ?? $tache->progression;
            }

            // Cohérence progression
            if (isset($data['progression'])) {
                if ($data['progression'] >= 100) {
                    $data['statut'] = Tache::STATUT_TERMINEE;
                    $data['date_cloture'] = $data['date_cloture'] ?? now();
                } elseif ($data['progression'] > 0 && $tache->statut === Tache::STATUT_A_FAIRE) {
                    $data['statut'] = Tache::STATUT_EN_COURS;
                    $data['date_debut'] = $data['date_debut'] ?? now();
                }
            }

            $tache->update($data);
            return $tache->fresh();
        });
    }

    /**
     * Génère une référence unique au format TACHE-YYYY-XXXX.
     */
    protected function genererReference(): string
    {
        $annee = date('Y');
        $prefix = "TACHE-{$annee}-";

        $derniere = Tache::withTrashed()
            ->where('reference', 'like', $prefix.'%')
            ->orderBy('reference', 'desc')
            ->first();

        $numero = 1;
        if ($derniere) {
            $parts = explode('-', $derniere->reference);
            $numero = (int) end($parts) + 1;
        }

        return $prefix.str_pad($numero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Statistiques pour le dashboard organisation.
     */
    public function statistiques(): array
    {
        return [
            'total'            => Tache::count(),
            'a_faire'          => Tache::where('statut', Tache::STATUT_A_FAIRE)->count(),
            'en_cours'         => Tache::where('statut', Tache::STATUT_EN_COURS)->count(),
            'en_revue'         => Tache::where('statut', Tache::STATUT_EN_REVUE)->count(),
            'terminees'        => Tache::where('statut', Tache::STATUT_TERMINEE)->count(),
            'annulees'         => Tache::where('statut', Tache::STATUT_ANNULEE)->count(),
            'urgentes'         => Tache::urgentes()->count(),
            'en_retard'        => Tache::enRetard()->count(),
            'par_categorie'    => Tache::selectRaw('categorie, COUNT(*) as count')
                ->groupBy('categorie')
                ->pluck('count', 'categorie')
                ->toArray(),
            'par_priorite'     => Tache::selectRaw('priorite, COUNT(*) as count')
                ->groupBy('priorite')
                ->pluck('count', 'priorite')
                ->toArray(),
        ];
    }
}
