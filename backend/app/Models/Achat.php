<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achat extends Model
{
    use HasFactory;

    protected $fillable = ['reference', 'fournisseur_id', 'entrepot_id', 'statut', 'statut_paiement', 'montant_total', 'notes', 'order_tax', 'discount', 'shipping'];

    public function lignes()
    {
        return $this->hasMany(AchatLigne::class);
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class);
    }
}