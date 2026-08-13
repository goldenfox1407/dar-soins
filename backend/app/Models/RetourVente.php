<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetourVente extends Model
{
    use HasFactory;

    protected $table = 'retour_ventes';

    protected $fillable = [
        'reference',
        'vente_id',
        'client_id',
        'entrepot_id',
        'statut',
        'montant_total',
        'notes',
        'user_id',
    ];

    public function vente()
    {
        return $this->belongsTo(Vente::class, 'vente_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

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
        return $this->hasMany(RetourVenteLigne::class, 'retour_vente_id');
    }
}
