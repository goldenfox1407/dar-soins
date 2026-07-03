<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $fillable = [
        'intervention_id',
        'montant_estime',
        'frais_deplacement',
        'statut',
        'date',
    ];

    public function intervention()
    {
        return $this->belongsTo(Intervention::class);
    }
}
