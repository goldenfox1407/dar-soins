<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $guarded = [];

    public function materiels() {
        return $this->belongsToMany(Materiel::class, 'materiel_produit')->withPivot('quantite_requise');
    }
}
