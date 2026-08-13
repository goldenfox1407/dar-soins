<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ajustement extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'entrepot_id',
        'date',
        'total_produits',
        'notes',
        'user_id',
    ];

    public function entrepot()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lignes()
    {
        return $this->hasMany(AjustementLigne::class, 'ajustement_id');
    }
}
