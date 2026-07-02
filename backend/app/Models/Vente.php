<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vente extends Model
{
    use HasFactory;

    protected $fillable = ['reference', 'client_id', 'entrepot_id', 'statut', 'statut_paiement', 'montant_total', 'note_vente'];
}