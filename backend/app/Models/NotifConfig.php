<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotifConfig extends Model
{
    protected $fillable = [
        'evenement', 'label', 'icone',
        'canal_email', 'canal_sms', 'canal_app',
        'destinataires', 'est_actif',
    ];

    protected $casts = [
        'canal_email'   => 'boolean',
        'canal_sms'     => 'boolean',
        'canal_app'     => 'boolean',
        'est_actif'     => 'boolean',
        'destinataires' => 'array',
    ];
}
