<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Devis extends Model
{
    use SoftDeletes;
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
