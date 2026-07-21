<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'telephone',
        'date_naissance',
        'latitude',
        'longitude',
        'adresse',
        'code_client',
        'pays',
        'ville',
        'code_postal',
        'numero_taxe',
        'limite_credit',
        'notes_internes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function interventions()
    {
        return $this->hasMany(Intervention::class);
    }
}
