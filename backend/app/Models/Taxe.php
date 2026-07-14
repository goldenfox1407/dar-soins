<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Taxe extends Model
{
    protected $fillable = ['nom', 'taux', 'type', 'est_defaut', 'est_actif', 'description'];

    protected $casts = ['est_defaut' => 'boolean', 'est_actif' => 'boolean', 'taux' => 'float'];
}
