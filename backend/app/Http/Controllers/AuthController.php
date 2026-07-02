<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:client,infirmier,gestionnaire',
        ]);

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

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

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
        if ($user->role === 'client') $user->load('client');
        if ($user->role === 'infirmier') $user->load('infirmier');
        if ($user->role === 'gestionnaire') $user->load('gestionnaire');
        
        return response()->json(new UserResource($user));
    }
}
