<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetourVenteLigne extends Model
{
    use HasFactory;

    protected $table = 'retour_vente_lignes';

    protected $fillable = [
        'retour_vente_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'sous_total',
    ];

    public function retourVente()
    {
        return $this->belongsTo(RetourVente::class, 'retour_vente_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}
