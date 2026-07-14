<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'client',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Ensures a Spatie role exists and assigns it to the user.
     */
    private function ensureRole(User $user, string $roleName): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(
            ['name' => $roleName, 'guard_name' => 'web']
        );
        $user->assignRole($roleName);
    }

    /**
     * State for client role with Client profile.
     */
    public function client(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'client',
        ])->afterCreating(function (User $user) {
            Client::factory()->create(['user_id' => $user->id]);
            $this->ensureRole($user, 'client');
        });
    }

    /**
     * State for infirmier role with Infirmier profile.
     */
    public function infirmier(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'infirmier',
        ])->afterCreating(function (User $user) {
            Infirmier::factory()->create(['user_id' => $user->id]);
            $this->ensureRole($user, 'infirmier');
        });
    }

    /**
     * State for gestionnaire role with Gestionnaire profile.
     */
    public function gestionnaire(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'gestionnaire',
        ])->afterCreating(function (User $user) {
            Gestionnaire::factory()->create(['user_id' => $user->id]);
            $this->ensureRole($user, 'gestionnaire');
        });
    }
}
