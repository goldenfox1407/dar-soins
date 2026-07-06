<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        return User::with(['roles', 'infirmier'])->paginate(15);
    }

    public function store(Request $request)
    {
        $rules = [
            'nom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
        ];

        // Validation supplémentaire pour les infirmiers
        if ($request->role === 'infirmier') {
            $rules['prenom'] = 'required|string|max:255';
            $rules['cin'] = 'required|string|max:50';
            $rules['telephone_infirmier'] = 'required|string|max:20';
            $rules['specialite'] = 'required|string|max:255';
            $rules['type_contrat'] = 'required|in:salarie,par_acte,les_deux';
            $rules['photo_cin_recto'] = 'required|image|max:5120';
            $rules['photo_cin_verso'] = 'required|image|max:5120';
            $rules['photo_diplome'] = 'required|image|max:5120';
        }

        $request->validate($rules);

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom ?? null,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $user->assignRole($request->role);

        // Create specific profile based on role
        if ($request->role === 'client') {
            Client::create(['user_id' => $user->id]);
        } elseif ($request->role === 'infirmier') {
            $infirmierData = [
                'user_id' => $user->id,
                'specialite' => $request->specialite ?? 'Polyvalent',
                'cin' => $request->cin,
                'telephone' => $request->telephone_infirmier,
                'type_contrat' => $request->type_contrat ?? 'salarie',
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'adresse_residence' => $request->adresse_residence,
            ];

            // Upload des fichiers
            if ($request->hasFile('photo_cin_recto')) {
                $infirmierData['photo_cin_recto'] = $request->file('photo_cin_recto')->store('infirmiers/cin', 'public');
            }
            if ($request->hasFile('photo_cin_verso')) {
                $infirmierData['photo_cin_verso'] = $request->file('photo_cin_verso')->store('infirmiers/cin', 'public');
            }
            if ($request->hasFile('photo_diplome')) {
                $infirmierData['photo_diplome'] = $request->file('photo_diplome')->store('infirmiers/diplomes', 'public');
            }

            Infirmier::create($infirmierData);
        } elseif ($request->role === 'gestionnaire') {
            Gestionnaire::create(['user_id' => $user->id]);
        }

        return response()->json($user->load('roles'), 201);
    }

    public function update(Request $request, User $user)
    {
        $rules = [
            'nom' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string|exists:roles,name',
        ];

        if ($request->role === 'infirmier') {
            $rules['cin'] = 'nullable|string|max:50';
            $rules['telephone_infirmier'] = 'nullable|string|max:20';
            $rules['specialite'] = 'nullable|string|max:255';
            $rules['type_contrat'] = 'nullable|in:salarie,par_acte,les_deux';
            $rules['photo_cin_recto'] = 'nullable|image|max:5120';
            $rules['photo_cin_verso'] = 'nullable|image|max:5120';
            $rules['photo_diplome'] = 'nullable|image|max:5120';
        }

        $request->validate($rules);

        $user->update([
            'nom' => $request->nom,
            'prenom' => $request->prenom ?? $user->prenom,
            'email' => $request->email,
            'role' => $request->role,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password)
            ]);
        }

        $user->syncRoles([$request->role]);

        // Mise à jour du profil infirmier
        if ($request->role === 'infirmier') {
            $infirmier = Infirmier::firstOrCreate(['user_id' => $user->id]);
            
            $updateData = [
                'specialite' => $request->specialite ?? $infirmier->specialite,
                'cin' => $request->cin ?? $infirmier->cin,
                'telephone' => $request->telephone_infirmier ?? $infirmier->telephone,
                'type_contrat' => $request->type_contrat ?? $infirmier->type_contrat,
                'latitude' => $request->latitude ?? $infirmier->latitude,
                'longitude' => $request->longitude ?? $infirmier->longitude,
                'adresse_residence' => $request->adresse_residence ?? $infirmier->adresse_residence,
            ];

            if ($request->hasFile('photo_cin_recto')) {
                $updateData['photo_cin_recto'] = $request->file('photo_cin_recto')->store('infirmiers/cin', 'public');
            }
            if ($request->hasFile('photo_cin_verso')) {
                $updateData['photo_cin_verso'] = $request->file('photo_cin_verso')->store('infirmiers/cin', 'public');
            }
            if ($request->hasFile('photo_diplome')) {
                $updateData['photo_diplome'] = $request->file('photo_diplome')->store('infirmiers/diplomes', 'public');
            }

            $infirmier->update($updateData);
        }

        return response()->json($user->load('roles'));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, 204);
    }
}

