<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetourAchat extends Model
{
    use HasFactory;

    protected $table = 'retour_achats';

    protected $fillable = ['reference', 'achat_id', 'fournisseur_id', 'entrepot_id', 'statut', 'montant_total', 'notes'];

    public function achat()
    {
        return $this->belongsTo(Achat::class);
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class);
    }

    public function lignes()
    {
        return $this->hasMany(RetourAchatLigne::class, 'retour_achat_id');
    }
}
