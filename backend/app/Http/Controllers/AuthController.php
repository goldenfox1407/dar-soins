<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use App\Http\Resources\UserResource;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\ServiceNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Create specific profile based on role
        if ($user->role === 'client') {
            Client::create([
                'user_id' => $user->id,
                'telephone' => $request->telephone,
                'date_naissance' => $request->date_naissance,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'adresse' => $request->adresse,
            ]);
        } elseif ($user->role === 'infirmier') {
            Infirmier::create(['user_id' => $user->id, 'specialite' => 'Polyvalent']);
        } elseif ($user->role === 'gestionnaire') {
            Gestionnaire::create(['user_id' => $user->id]);
        }

        // Assign Spatie role (creates it if missing)
        \Spatie\Permission\Models\Role::firstOrCreate(
            ['name' => $user->role, 'guard_name' => 'web']
        );
        $user->assignRole($user->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Notification : Nouveau client inscrit → gestionnaire(s)
        if ($user->role === 'client') {
            try {
                $user->load('client');
                ServiceNotification::dispatcher('nouveau_client', $user, [
                    'url_cible' => "/gestionnaire/clients/{$user->client->id}",
                ]);
            } catch (\Throwable $e) {
                Log::error('Erreur notification nouveau_client: '.$e->getMessage(), ['exception' => $e]);
            }
        }

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token
        ], 201);
    }

    public function login(LoginRequest $request)
    {

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token
        ]);
    }

    public function user(Request $request)
    {
        $user = clone $request->user();
        if ($user->hasRole('client')) $user->load('client');
        if ($user->hasRole('infirmier')) $user->load('infirmier');
        if ($user->hasRole('gestionnaire')) $user->load('gestionnaire');

        return response()->json(new UserResource($user));
    }
}
