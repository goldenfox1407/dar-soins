<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tache extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference', 'titre', 'description',
        'statut', 'priorite', 'categorie',
        'assigne_a', 'cree_par',
        'echeance', 'date_debut', 'date_cloture',
        'intervention_id', 'tags', 'progression',
    ];

    protected $casts = [
        'echeance'      => 'date',
        'date_debut'    => 'datetime',
        'date_cloture'  => 'datetime',
        'tags'          => 'array',
        'progression'   => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Constantes
    |--------------------------------------------------------------------------
    */
    public const STATUT_A_FAIRE = 'a_faire';
    public const STATUT_EN_COURS = 'en_cours';
    public const STATUT_EN_REVUE = 'en_revue';
    public const STATUT_TERMINEE = 'terminee';
    public const STATUT_ANNULEE = 'annulee';

    public const PRIORITE_BASSE = 'basse';
    public const PRIORITE_NORMALE = 'normale';
    public const PRIORITE_HAUTE = 'haute';
    public const PRIORITE_URGENTE = 'urgente';

    public const CATEGORIE_ORGANISATION = 'organisation';
    public const CATEGORIE_ADMINISTRATIF = 'administratif';
    public const CATEGORIE_LOGISTIQUE = 'logistique';
    public const CATEGORIE_RH = 'rh';
    public const CATEGORIE_AUTRE = 'autre';

    public static function statuts(): array
    {
        return [
            self::STATUT_A_FAIRE  => 'À faire',
            self::STATUT_EN_COURS => 'En cours',
            self::STATUT_EN_REVUE => 'En revue',
            self::STATUT_TERMINEE => 'Terminée',
            self::STATUT_ANNULEE => 'Annulée',
        ];
    }

    public static function priorites(): array
    {
        return [
            self::PRIORITE_BASSE   => 'Basse',
            self::PRIORITE_NORMALE => 'Normale',
            self::PRIORITE_HAUTE   => 'Haute',
            self::PRIORITE_URGENTE => 'Urgente',
        ];
    }

    public static function categories(): array
    {
        return [
            self::CATEGORIE_ORGANISATION  => 'Organisation',
            self::CATEGORIE_ADMINISTRATIF => 'Administratif',
            self::CATEGORIE_LOGISTIQUE    => 'Logistique',
            self::CATEGORIE_RH            => 'Ressources humaines',
            self::CATEGORIE_AUTRE         => 'Autre',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function assigne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigne_a');
    }

    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    public function intervention(): BelongsTo
    {
        return $this->belongsTo(Intervention::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeEnCours($query)
    {
        return $query->where('statut', self::STATUT_EN_COURS);
    }

    public function scopeNonTerminees($query)
    {
        return $query->whereNotIn('statut', [self::STATUT_TERMINEE, self::STATUT_ANNULEE]);
    }

    public function scopeUrgentes($query)
    {
        return $query->where('priorite', self::PRIORITE_URGENTE)
            ->whereNotIn('statut', [self::STATUT_TERMINEE, self::STATUT_ANNULEE]);
    }

    public function scopeEnRetard($query)
    {
        return $query->whereNotNull('echeance')
            ->where('echeance', '<', now()->toDateString())
            ->whereNotIn('statut', [self::STATUT_TERMINEE, self::STATUT_ANNULEE]);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function estTerminee(): bool
    {
        return $this->statut === self::STATUT_TERMINEE;
    }

    public function estEnRetard(): bool
    {
        return $this->echeance
            && $this->echeance->isPast()
            && ! $this->estTerminee()
            && $this->statut !== self::STATUT_ANNULEE;
    }

    /**
     * Couleur associée au statut (pour le frontend).
     */
    public function couleurStatut(): string
    {
        return match ($this->statut) {
            self::STATUT_A_FAIRE  => '#64748B', // slate-500
            self::STATUT_EN_COURS => '#2563EB', // blue-600
            self::STATUT_EN_REVUE => '#F59E0B', // amber-500
            self::STATUT_TERMINEE => '#10B981', // emerald-500
            self::STATUT_ANNULEE  => '#EF4444', // red-500
            default               => '#64748B',
        };
    }
}
