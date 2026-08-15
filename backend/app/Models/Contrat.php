<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    use HasFactory;

    protected $table = 'contrats';

    protected $fillable = [
        'reference',
        'client_id',
        'infirmier_id',
        'type_garde',
        'date_debut',
        'date_fin',
        'horaires_garde',
        'tarif_journalier',
        'montant_total',
        'statut',
        'clauses_specifiques',
        'prescriptions_medicales',
        'user_id',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function infirmier()
    {
        return $this->belongsTo(Infirmier::class, 'infirmier_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
