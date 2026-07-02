<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VenteLigne extends Model
{
    use HasFactory;

    protected $fillable = ['vente_id', 'produit_id', 'quantite', 'prix_unitaire', 'sous_total'];
}