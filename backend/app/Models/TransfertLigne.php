<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransfertLigne extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfert_id',
        'produit_id',
        'quantite',
    ];

    public function transfert()
    {
        return $this->belongsTo(Transfert::class, 'transfert_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}
