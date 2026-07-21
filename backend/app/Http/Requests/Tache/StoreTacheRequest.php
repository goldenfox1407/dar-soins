<?php

namespace App\Http\Requests\Tache;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Tache;

class StoreTacheRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titre'           => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string', 'max:5000'],
            'statut'          => ['nullable', Rule::in(array_keys(Tache::statuts()))],
            'priorite'        => ['nullable', Rule::in(array_keys(Tache::priorites()))],
            'categorie'       => ['nullable', Rule::in(array_keys(Tache::categories()))],
            'assigne_a'       => ['nullable', 'exists:users,id'],
            'echeance'        => ['nullable', 'date', 'after_or_equal:today'],
            'intervention_id' => ['nullable', 'exists:interventions,id'],
            'tags'            => ['nullable', 'array'],
            'tags.*'          => ['string', 'max:50'],
            'progression'     => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'titre.required'     => 'Le titre est obligatoire.',
            'titre.max'          => 'Le titre ne doit pas dépasser 255 caractères.',
            'echeance.date'      => 'La date d\'échéance doit être une date valide.',
            'echeance.after_or_equal' => 'L\'échéance ne peut pas être dans le passé.',
            'progression.min'    => 'La progression doit être entre 0 et 100.',
            'progression.max'    => 'La progression doit être entre 0 et 100.',
        ];
    }
}
