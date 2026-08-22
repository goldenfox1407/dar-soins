<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class UniteBase extends Model
{
    protected $table = 'unites';
    protected $fillable = ['nom', 'symbole', 'nom_court', 'type'];

    protected static function booted()
    {
        static::addGlobalScope('type_unite_base', function (Builder $builder) {
            $builder->where('type', 'unite_base');
        });

        static::creating(function ($model) {
            $model->type = 'unite_base';
            if (empty($model->nom_court) && !empty($model->symbole)) {
                $model->nom_court = $model->symbole;
            }
        });
    }

    public function getSymboleAttribute($value)
    {
        return $value ?? $this->nom_court;
    }
}
