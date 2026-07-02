<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionFinanciere extends Model
{
    use HasFactory;

    protected $fillable = ['compte_id', 'type', 'montant', 'date_transaction', 'reference', 'description'];
}