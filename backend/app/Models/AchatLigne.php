<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AchatLigne extends Model
{
    use HasFactory;

    protected $fillable = ['achat_id', 'produit_id', 'quantite', 'cout_unitaire', 'sous_total'];
}