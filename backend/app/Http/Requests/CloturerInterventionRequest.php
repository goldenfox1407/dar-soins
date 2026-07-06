<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloturerInterventionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'infirmier';
    }

    public function rules(): array
    {
        return [
            'tension' => 'nullable|string|max:20',
            'glycemie' => 'nullable|numeric|min:0',
            'temperature' => 'nullable|numeric|between:30,45',
            'poids' => 'nullable|numeric|min:0',
            'notes_infirmier' => 'nullable|string|max:5000',
            'methode_paiement' => 'nullable|in:espece,carte,virement',
            'montant_recu' => 'nullable|numeric|min:0',
            'signature_patient' => 'nullable|string',
            'consommations' => 'nullable|array',
            'consommations.*.produit_id' => 'required_with:consommations|exists:produits,id',
            'consommations.*.quantite' => 'required_with:consommations|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'temperature.between' => 'La température doit être entre 30°C et 45°C.',
            'methode_paiement.in' => 'La méthode de paiement doit être espèce, carte ou virement.',
            'consommations.*.produit_id.exists' => 'Un des produits consommés n\'existe pas.',
            'consommations.*.quantite.min' => 'La quantité doit être au minimum 1.',
        ];
    }
}
