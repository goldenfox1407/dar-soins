<?php

describe('Authentication', function () {
    it('allows a user to register', function () {
        $response = $this->postJson('/api/register', [
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'role' => 'client',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.role', 'client');
    });

    it('allows a user to login', function () {
        \App\Models\User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('password123'),
            'role' => 'client',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    });

    it('returns user profile', function () {
        $user = \App\Models\User::factory()->create(['role' => 'client']);
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonPath('id', $user->id);
    });
});