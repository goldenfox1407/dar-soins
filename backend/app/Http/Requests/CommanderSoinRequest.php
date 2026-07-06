<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommanderSoinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'client';
    }

    public function rules(): array
    {
        return [
            'produit_id' => 'required|exists:produits,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'type' => 'required|in:ponctuel,garde_malade',
            'duree_heures' => 'nullable|numeric|min:1',
            'date_heure' => 'required|date|after:now',
            'description_probleme' => 'nullable|string|max:2000',
            'fichier_joint' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'produit_id.required' => 'Le type de soin est requis.',
            'produit_id.exists' => 'Le soin sélectionné n\'existe pas.',
            'latitude.required' => 'La position GPS est requise.',
            'longitude.required' => 'La position GPS est requise.',
            'type.in' => 'Le type doit être ponctuel ou garde_malade.',
            'date_heure.after' => 'La date de l\'intervention doit être dans le futur.',
            'fichier_joint.max' => 'Le fichier ne doit pas dépasser 5 Mo.',
        ];
    }
}
