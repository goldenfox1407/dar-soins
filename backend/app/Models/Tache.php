<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tache extends Model
{
    use HasFactory;

    protected $table = 'taches';

    protected $fillable = [
        'titre',
        'description',
        'employe_id',
        'priorite',
        'statut',
        'date_echeance',
        'couleur',
    ];

    protected $casts = [
        'date_echeance' => 'date',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class, 'employe_id');
    }
}
