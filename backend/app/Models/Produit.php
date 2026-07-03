<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'type',
        'image',
        'code_barres',
        'symbologie',
        'prix_achat',
        'prix_client',
        'remuneration_soignant',
        'type_remise',
        'valeur_remise',
        'stock_initial',
        'categorie_id',
        'marque_id',
        'unite_id',
        'gerer_stock',
        'quantite_alerte',
    ];

    public function materiels() {
        return $this->belongsToMany(Materiel::class, 'materiel_produit')->withPivot('quantite_requise');
    }
}
