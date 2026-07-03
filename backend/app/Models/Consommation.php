<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consommation extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'intervention_id',
        'produit_id',
        'quantite',
    ];

    public function materiel() {
        return $this->belongsTo(Materiel::class);
    }

    public function produit() {
        return $this->belongsTo(Produit::class);
    }

    public function intervention() {
        return $this->belongsTo(Intervention::class);
    }
}
