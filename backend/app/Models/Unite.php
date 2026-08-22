<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Unite extends Model
{
    use HasFactory;

    protected $table = 'unites';
    protected $fillable = ['nom', 'nom_court', 'symbole', 'type'];

    protected static function booted()
    {
        static::addGlobalScope('type_unite', function (Builder $builder) {
            $builder->where(function ($q) {
                $q->where('type', 'unite')->orWhereNull('type');
            });
        });

        static::creating(function ($model) {
            if (empty($model->type)) {
                $model->type = 'unite';
            }
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