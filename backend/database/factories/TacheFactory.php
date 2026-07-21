<?php

namespace Database\Factories;

use App\Models\Tache;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TacheFactory extends Factory
{
    protected $model = Tache::class;

    public function definition(): array
    {
        $statuts = array_keys(Tache::statuts());
        $priorites = array_keys(Tache::priorites());
        $categories = array_keys(Tache::categories());

        return [
            'reference'    => 'TACHE-'.date('Y').'-'.str_pad((string) $this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'titre'        => $this->faker->sentence(4, true),
            'description'  => $this->faker->paragraph(),
            'statut'       => $this->faker->randomElement($statuts),
            'priorite'     => $this->faker->randomElement($priorites),
            'categorie'    => $this->faker->randomElement($categories),
            'assigne_a'    => User::inRandomOrder()->first()?->id ?? User::factory(),
            'cree_par'     => User::where('role', 'gestionnaire')->first()?->id ?? User::factory(),
            'echeance'     => $this->faker->dateTimeBetween('-1 week', '+3 weeks'),
            'progression'   => $this->faker->numberBetween(0, 100),
            'tags'         => $this->faker->randomElements(['urgent', 'planning', 'client', 'logistique', 'rh'], $this->faker->numberBetween(0, 3)),
        ];
    }
}
