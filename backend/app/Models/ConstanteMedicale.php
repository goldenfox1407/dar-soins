<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConstanteMedicale extends Model
{
    use HasFactory;

    protected $fillable = [
        'intervention_id',
        'tension',
        'glycemie',
        'temperature',
        'poids',
        'date',
    ];
}
