<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetourAchatLigne extends Model
{
    use HasFactory;

    protected $table = 'retour_achat_lignes';

    protected $fillable = ['retour_achat_id', 'produit_id', 'quantite', 'cout_unitaire', 'sous_total'];

    public function retourAchat()
    {
        return $this->belongsTo(RetourAchat::class, 'retour_achat_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
