<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FichePaie extends Model
{
    use HasFactory;

    protected $table = 'fiches_paie';

    protected $fillable = [
        'employe_id',
        'reference',
        'mois_annee',
        'salaire_base',
        'commissions_actes',
        'primes',
        'deductions',
        'salaire_net',
        'statut_paiement',
        'date_paiement',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class, 'employe_id');
    }
}
