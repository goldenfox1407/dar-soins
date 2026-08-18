<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use App\Http\Resources\UserResource;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6',
        ]);

        if ($request->filled('new_password')) {
            if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->nom = $request->nom;
        $user->prenom = $request->prenom;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => new UserResource($user)
        ]);
    }
}
