<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfert extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'entrepot_source_id',
        'entrepot_destination_id',
        'date',
        'statut',
        'total_produits',
        'notes',
        'user_id',
    ];

    public function entrepotSource()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_source_id');
    }

    public function entrepotDestination()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_destination_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lignes()
    {
        return $this->hasMany(TransfertLigne::class, 'transfert_id');
    }
}
