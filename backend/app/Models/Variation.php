<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Variation extends Model
{
    protected $fillable = ['nom', 'valeurs'];
    
    protected function casts(): array
    {
        return [
            'valeurs' => 'array',
        ];
    }
}
