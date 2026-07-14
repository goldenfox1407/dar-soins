<?php

namespace App\Http\Controllers;

use App\Models\NotifConfig;
use Illuminate\Http\Request;

class NotifConfigController extends Controller
{
    public function index()
    {
        return response()->json(NotifConfig::orderBy('id')->get());
    }

    public function update(Request $request, NotifConfig $notifConfig)
    {
        $data = $request->validate([
            'canal_email'   => 'sometimes|boolean',
            'canal_sms'     => 'sometimes|boolean',
            'canal_app'     => 'sometimes|boolean',
            'destinataires' => 'sometimes|array',
            'destinataires.*' => 'in:gestionnaire,infirmier,client',
            'est_actif'     => 'sometimes|boolean',
        ]);

        $notifConfig->update($data);
        return response()->json($notifConfig);
    }

    public function toggle(Request $request, NotifConfig $notifConfig)
    {
        $notifConfig->update(['est_actif' => !$notifConfig->est_actif]);
        return response()->json($notifConfig);
    }
}
