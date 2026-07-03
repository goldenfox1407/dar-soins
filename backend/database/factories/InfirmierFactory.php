<?php

namespace Database\Factories;

use App\Models\Infirmier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Infirmier>
 */
class InfirmierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'infirmier']),
            'specialite' => 'Polyvalent',
            'est_disponible' => true,
            'latitude' => $this->faker->latitude(-90, 90),
            'longitude' => $this->faker->longitude(-180, 180),
        ];
    }
}
