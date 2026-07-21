<?php

namespace App\Http\Requests\Tache;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Tache;

class UpdateTacheRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titre'           => ['sometimes', 'required', 'string', 'max:255'],
            'description'     => ['nullable', 'string', 'max:5000'],
            'statut'          => ['nullable', Rule::in(array_keys(Tache::statuts()))],
            'priorite'        => ['nullable', Rule::in(array_keys(Tache::priorites()))],
            'categorie'       => ['nullable', Rule::in(array_keys(Tache::categories()))],
            'assigne_a'       => ['nullable', 'exists:users,id'],
            'echeance'        => ['nullable', 'date'],
            'date_debut'      => ['nullable', 'date'],
            'date_cloture'    => ['nullable', 'date', 'after_or_equal:date_debut'],
            'intervention_id' => ['nullable', 'exists:interventions,id'],
            'tags'            => ['nullable', 'array'],
            'tags.*'          => ['string', 'max:50'],
            'progression'     => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }
}
