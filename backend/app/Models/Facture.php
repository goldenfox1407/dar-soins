<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = [
        'intervention_id',
        'reference',
        'montant_total',
    ];

    public function intervention()
    {
        return $this->belongsTo(Intervention::class);
    }
}
