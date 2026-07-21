<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Broadcasting\PrivateChannel;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function infirmier()
    {
        return $this->hasOne(Infirmier::class);
    }

    public function gestionnaire()
    {
        return $this->hasOne(Gestionnaire::class);
    }

    public function tachesAssignees()
    {
        return $this->hasMany(Tache::class, 'assigne_a');
    }

    public function tachesCreees()
    {
        return $this->hasMany(Tache::class, 'cree_par');
    }

    /*
    |--------------------------------------------------------------------------
    | Notifications - réception sur canal privé temps réel
    |--------------------------------------------------------------------------
    */

    /**
     * Canal de broadcast pour les notifications de ce user.
     * Surchargé pour utiliser un canal privé dédié (écouté par Laravel Echo côté front).
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'notifications.'.$this->id;
    }

    /**
     * Récupère le nom complet de l'utilisateur.
     */
    public function getNomCompletAttribute(): string
    {
        return trim(($this->prenom ?? '').' '.$this->nom);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Vérifie si l'utilisateur est gestionnaire (admin).
     */
    public function estGestionnaire(): bool
    {
        return $this->role === 'gestionnaire' || $this->hasRole('gestionnaire');
    }

    /**
     * Vérifie si l'utilisateur est infirmier.
     */
    public function estInfirmier(): bool
    {
        return $this->role === 'infirmier' || $this->hasRole('infirmier');
    }

    /**
     * Vérifie si l'utilisateur est client.
     */
    public function estClient(): bool
    {
        return $this->role === 'client' || $this->hasRole('client');
    }
}
