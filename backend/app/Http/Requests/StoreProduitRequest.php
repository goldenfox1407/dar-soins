<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'gestionnaire';
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'type' => 'required|in:soin,garde,consommable',
            'prix_client' => 'required|numeric|min:0',
            'prix_achat' => 'nullable|numeric|min:0',
            'stock_initial' => 'nullable|integer|min:0',
            'remuneration_soignant' => 'nullable|numeric|min:0',
            'type_remise' => 'in:none,percent,fixed',
            'valeur_remise' => 'numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'description' => 'nullable|string|max:2000',
            'code_barres' => 'nullable|string|max:100',
            'symbologie' => 'nullable|string|max:50',
            'categorie_id' => 'nullable|exists:categories,id',
            'marque_id' => 'nullable|exists:marques,id',
            'unite_id' => 'nullable|exists:unites,id',
            'gerer_stock' => 'nullable|boolean',
            'quantite_alerte' => 'nullable|integer|min:0',
            'materiels' => 'nullable|array',
            'materiels.*.materiel_id' => 'required_with:materiels|exists:materiels,id',
            'materiels.*.quantite_requise' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom du produit est requis.',
            'type.in' => 'Le type doit être soin, garde ou consommable.',
            'prix_client.required' => 'Le prix client est requis.',
            'prix_client.min' => 'Le prix client doit être positif.',
            'image.max' => 'L\'image ne doit pas dépasser 2 Mo.',
        ];
    }
}
