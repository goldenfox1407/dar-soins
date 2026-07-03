<?php

namespace Database\Factories;

use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Produit>
 */
class ProduitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => $this->faker->word,
            'description' => $this->faker->sentence,
            'type' => $this->faker->randomElement(['soin', 'garde', 'consommable']),
            'prix_client' => $this->faker->numberBetween(10, 500),
            'prix_achat' => $this->faker->numberBetween(5, 300),
            'remuneration_soignant' => $this->faker->numberBetween(5, 200),
            'type_remise' => 'none',
            'valeur_remise' => 0,
            'stock_initial' => $this->faker->numberBetween(0, 100),
        ];
    }
}
