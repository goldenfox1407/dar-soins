<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotifConfig extends Model
{
    protected $fillable = [
        'evenement', 'label', 'icone',
        'canal_email', 'canal_sms', 'canal_app',
        'destinataires', 'est_actif',
    ];

    protected $casts = [
        'canal_email'   => 'boolean',
        'canal_sms'     => 'boolean',
        'canal_app'     => 'boolean',
        'est_actif'     => 'boolean',
        'destinataires' => 'array',
    ];

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Récupère la config d'un événement par son slug.
     */
    public static function pourEvenement(string $evenement): ?self
    {
        return static::where('evenement', $evenement)->first();
    }

    /**
     * Vérifie si un canal donné est activé pour cet événement.
     */
    public function canalActif(string $canal): bool
    {
        if (! $this->est_actif) {
            return false;
        }

        return match ($canal) {
            'email' => $this->canal_email,
            'sms'   => $this->canal_sms,
            'app'   => $this->canal_app,
            default => false,
        };
    }

    /**
     * Vérifie si un rôle donné fait partie des destinataires.
     */
    public function destinataireInclus(string $role): bool
    {
        if (! $this->est_actif) {
            return false;
        }

        return in_array($role, $this->destinataires ?? []);
    }
}
