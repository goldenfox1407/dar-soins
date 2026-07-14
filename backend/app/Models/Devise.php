<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devise extends Model
{
    protected $fillable = ['code', 'nom', 'symbole', 'taux_change', 'est_defaut', 'est_actif'];

    protected $casts = ['est_defaut' => 'boolean', 'est_actif' => 'boolean', 'taux_change' => 'float'];
}
