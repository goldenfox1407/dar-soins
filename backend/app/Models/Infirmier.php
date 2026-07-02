<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infirmier extends Model
{
    protected $fillable = [
        'user_id', 'specialite', 'est_disponible', 'latitude', 'longitude', 
        'adresse_residence', 'cin', 'photo_cin_recto', 'photo_cin_verso', 
        'photo_diplome', 'telephone', 'type_contrat'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

