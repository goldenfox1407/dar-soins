<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $guarded = [];

    public function intervention()
    {
        return $this->belongsTo(Intervention::class);
    }
}
