<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{
    protected $fillable = [
        'intervention_id',
        'localisation_id',
        'imageBase64',
        'date',
    ];
}
