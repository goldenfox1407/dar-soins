<?php

describe('Produits API', function () {
    it('returns all produits for public', function () {
        \App\Models\Produit::factory()->count(3)->create();

        $response = $this->getJson('/api/produits');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    });

    it('allows admin to create a produit', function () {
        $admin = \App\Models\User::factory()->create(['role' => 'gestionnaire']);
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/produits', [
                'nom' => 'Test Product',
                'type' => 'soin',
                'prix_client' => 100,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('produit.nom', 'Test Product');
    });

    it('allows admin to update a produit', function () {
        $admin = \App\Models\User::factory()->create(['role' => 'gestionnaire']);
        $produit = \App\Models\Produit::factory()->create();
        
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/produits/{$produit->id}", [
                'nom' => 'Updated Product',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('produit.nom', 'Updated Product');
    });

    it('allows admin to delete a produit', function () {
        $admin = \App\Models\User::factory()->create(['role' => 'gestionnaire']);
        $produit = \App\Models\Produit::factory()->create();
        
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/produits/{$produit->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Produit supprimé']);
    });
});