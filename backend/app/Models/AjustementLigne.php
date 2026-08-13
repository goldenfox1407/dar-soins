<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AjustementLigne extends Model
{
    use HasFactory;

    protected $fillable = [
        'ajustement_id',
        'produit_id',
        'type',
        'quantite',
    ];

    public function ajustement()
    {
        return $this->belongsTo(Ajustement::class, 'ajustement_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}
