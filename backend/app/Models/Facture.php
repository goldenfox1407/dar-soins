<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facture extends Model
{
    use SoftDeletes;
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
