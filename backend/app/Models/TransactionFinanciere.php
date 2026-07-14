<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionFinanciere extends Model
{
    use HasFactory;

    protected $table = 'transactions_financieres';

    protected $fillable = ['compte_id', 'achat_id', 'type', 'montant', 'date_transaction', 'reference', 'description'];

    public function achat()
    {
        return $this->belongsTo(Achat::class);
    }
}