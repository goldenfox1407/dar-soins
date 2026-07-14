<?php

describe('Intervention API', function () {
    it('allows client to commander soin', function () {
        $client = \App\Models\User::factory()->client()->create();
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
            ->assertJsonStructure(['message', 'intervention']);
    });

    it('allows infirmier to cloturer intervention', function () {
        \App\Models\Config::firstOrCreate([], ['tkmf_sm' => 2.5, 'tva' => 20]);

        $infirmier = \App\Models\User::factory()->infirmier()->create();
        $intervention = \App\Models\Intervention::factory()->create([
            'infirmier_id'      => $infirmier->infirmier->id,
            'distance_manuelle' => 3.5,
        ]);

        $response = $this->actingAs($infirmier, 'sanctum')
            ->postJson("/api/interventions/{$intervention->id}/cloturer", [
                'tension' => '120/80',
                'glycemie' => 5.5,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'intervention', 'facture']);
    });

    it('returns 422 when cloturer has no distance available', function () {
        $infirmier = \App\Models\User::factory()->infirmier()->create();
        $intervention = \App\Models\Intervention::factory()->create([
            'infirmier_id'     => $infirmier->infirmier->id,
            'distance_manuelle' => null,
            'localisation_id'  => null,
        ]);

        $response = $this->actingAs($infirmier, 'sanctum')
            ->postJson("/api/interventions/{$intervention->id}/cloturer", [
                'tension' => '120/80',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Distance non disponible. Veuillez saisir la distance manuellement avant de clôturer.');
    });

    it('blocks a client from responding to another client devis', function () {
        $owner  = \App\Models\User::factory()->client()->create();
        $other  = \App\Models\User::factory()->client()->create();
        $intervention = \App\Models\Intervention::factory()->create([
            'client_id' => $owner->client->id,
        ]);

        $response = $this->actingAs($other, 'sanctum')
            ->postJson("/api/interventions/{$intervention->id}/reponse-client", [
                'accepte' => true,
            ]);

        $response->assertStatus(403);
    });

    it('allows the owner client to respond to their devis', function () {
        $owner = \App\Models\User::factory()->client()->create();
        $intervention = \App\Models\Intervention::factory()->create([
            'client_id' => $owner->client->id,
        ]);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/interventions/{$intervention->id}/reponse-client", [
                'accepte' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Devis accepté. Soin confirmé.');
    });
});