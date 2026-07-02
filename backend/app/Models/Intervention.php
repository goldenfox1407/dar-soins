<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Intervention extends Model
{
    use HasFactory;
    
    protected $guarded = [];

    public function client() {
        return $this->belongsTo(Client::class);
    }

    public function infirmier() {
        return $this->belongsTo(Infirmier::class);
    }

    public function produit() {
        return $this->belongsTo(Produit::class);
    }

    public function localisation() {
        return $this->belongsTo(Localisation::class);
    }

    public function consommations() {
        return $this->hasMany(Consommation::class);
    }

    public function constantes() {
        return $this->hasMany(ConstanteMedicale::class);
    }

    public function devis() {
        return $this->hasOne(Devis::class);
    }

    public function facture() {
        return $this->hasOne(Facture::class);
    }

    public function infirmiers_refuses() {
        return $this->belongsToMany(Infirmier::class, 'intervention_refus');
    }
}
