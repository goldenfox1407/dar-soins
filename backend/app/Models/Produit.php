<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produit extends Model
{
    use HasFactory, SoftDeletes;

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
}
