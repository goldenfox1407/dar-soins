<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompteBancaire extends Model
{
    use HasFactory;

    protected $fillable = ['nom_compte', 'numero_compte', 'solde_initial', 'details'];
}