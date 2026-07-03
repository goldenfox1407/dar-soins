<?php

namespace Database\Factories;

use App\Models\Localisation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Localisation>
 */
class LocalisationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'latitude' => $this->faker->latitude(-90, 90),
            'longitude' => $this->faker->longitude(-180, 180),
        ];
    }
}
