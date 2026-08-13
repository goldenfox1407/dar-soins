<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $table = 'employes';

    protected $fillable = [
        'user_id',
        'matricule',
        'type_employe',
        'mode_remuneration',
        'salaire_base',
        'tarif_acte',
        'cin',
        'telephone',
        'date_embauche',
        'statut',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function presences()
    {
        return $this->hasMany(Presence::class, 'employe_id');
    }

    public function conges()
    {
        return $this->hasMany(Conge::class, 'employe_id');
    }

    public function fichesPaie()
    {
        return $this->hasMany(FichePaie::class, 'employe_id');
    }
}