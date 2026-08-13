<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conge extends Model
{
    use HasFactory;

    protected $table = 'conges';

    protected $fillable = [
        'employe_id',
        'type_conge',
        'date_debut',
        'date_fin',
        'nombre_jours',
        'statut',
        'motif',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class, 'employe_id');
    }
}
