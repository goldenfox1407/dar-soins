<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniteBase extends Model
{
    protected $table = 'unites_bases';
    protected $fillable = ['nom', 'symbole'];
}
