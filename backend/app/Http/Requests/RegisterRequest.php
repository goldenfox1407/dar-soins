<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:client,infirmier,gestionnaire',
            // Client-specific fields
            'telephone' => 'nullable|string|max:20',
            'date_naissance' => 'nullable|date',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'adresse' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prénom est requis.',
            'email.required' => 'L\'adresse email est requise.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
            'role.in' => 'Le rôle doit être client, infirmier ou gestionnaire.',
        ];
    }
}
