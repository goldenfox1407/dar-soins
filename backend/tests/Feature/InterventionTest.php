<?php

describe('Intervention API', function () {
    it('allows client to commander soin', function () {
        $client = \App\Models\User::factory()->create(['role' => 'client']);
        $produit = \App\Models\Produit::factory()->create();
        
        $response = $this->actingAs($client, 'sanctum')
            ->postJson('/api/interventions/commander', [
                'produit_id' => $produit->id,
                'latitude' => 33.5731,
                'longitude' => -7.5898,
                'type' => 'ponctuel',
                'date_heure' => now()->addDay()->toDateTimeString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'intervention', 'devis', 'distance_infirmier_km']);
    });

    it('allows infirmier to cloturer intervention', function () {
        $infirmier = \App\Models\User::factory()->create(['role' => 'infirmier']);
        $intervention = \App\Models\Intervention::factory()->create([
            'infirmier_id' => $infirmier->infirmier->id,
        ]);
        
        $response = $this->actingAs($infirmier, 'sanctum')
            ->postJson("/api/interventions/{$intervention->id}/cloturer", [
                'tension' => '120/80',
                'glycemie' => 5.5,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'intervention', 'facture']);
    });
});