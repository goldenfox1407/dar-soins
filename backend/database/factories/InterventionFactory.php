<?php

namespace Database\Factories;

use App\Models\Intervention;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Produit;
use App\Models\Localisation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Intervention>
 */
class InterventionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'infirmier_id' => Infirmier::factory(),
            'produit_id' => Produit::factory(),
            'localisation_id' => Localisation::factory(),
            'date_heure' => now()->addDay(),
            'type' => 'ponctuel',
            'duree_heures' => null,
            'statut' => 'en_attente_affectation',
            'description_probleme' => $this->faker->sentence,
            'fichier_joint' => null,
        ];
    }
}
