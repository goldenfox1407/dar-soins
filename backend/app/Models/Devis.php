<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $guarded = [];

    public function intervention()
    {
        return $this->belongsTo(Intervention::class);
    }
}
