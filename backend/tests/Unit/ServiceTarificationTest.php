<?php

use App\Models\Config;
use App\Models\Intervention;
use App\Models\Produit;
use App\Services\ServiceTarification;

function makeIntervention(array $produitAttrs = [], array $interventionAttrs = []): Intervention
{
    $produit = Produit::factory()->create(array_merge([
        'prix_client'   => 100.0,
        'type_remise'   => 'none',
        'valeur_remise' => 0,
    ], $produitAttrs));

    return Intervention::factory()->create(array_merge([
        'produit_id'      => $produit->id,
        'type'            => 'ponctuel',
        'duree_heures'    => null,
        'tarif_km_manuel' => null,
    ], $interventionAttrs));
}

beforeEach(function () {
    Config::firstOrCreate([], ['tkmf_sm' => 2.5, 'tva' => 20]);
});

it('calcule le prix soin sans remise', function () {
    $intervention = makeIntervention();
    $devis = (new ServiceTarification())->calculerDevis($intervention, 0);
    // 100 HT × 1.20 = 120 TTC
    expect((float) $devis->montant_estime)->toBe(120.0);
});

it('applique une remise en pourcentage', function () {
    $intervention = makeIntervention(['type_remise' => 'percent', 'valeur_remise' => 10]);
    $devis = (new ServiceTarification())->calculerDevis($intervention, 0);
    // 100 - 10% = 90 HT × 1.20 = 108 TTC
    expect((float) $devis->montant_estime)->toBe(108.0);
});

it('applique une remise fixe', function () {
    $intervention = makeIntervention(['type_remise' => 'fixed', 'valeur_remise' => 20]);
    $devis = (new ServiceTarification())->calculerDevis($intervention, 0);
    // 100 - 20 = 80 HT × 1.20 = 96 TTC
    expect((float) $devis->montant_estime)->toBe(96.0);
});

it('calcule les frais de déplacement', function () {
    $intervention = makeIntervention();
    $devis = (new ServiceTarification())->calculerDevis($intervention, 4);
    // (100 + 4×2.5) × 1.20 = 110 × 1.20 = 132 TTC
    expect((float) $devis->montant_estime)->toBe(132.0);
});

it('utilise le tarif_km_manuel si défini', function () {
    $intervention = makeIntervention([], ['tarif_km_manuel' => 5.0]);
    $devis = (new ServiceTarification())->calculerDevis($intervention, 2);
    // (100 + 2×5) × 1.20 = 110 × 1.20 = 132 TTC
    expect((float) $devis->montant_estime)->toBe(132.0);
});

it('multiplie le prix par les heures pour garde_malade', function () {
    $intervention = makeIntervention([], ['type' => 'garde_malade', 'duree_heures' => 3]);
    $devis = (new ServiceTarification())->calculerDevis($intervention, 0);
    // 100 × 3h = 300 HT × 1.20 = 360 TTC
    expect((float) $devis->montant_estime)->toBe(360.0);
});

it('lève une exception si Config est absente', function () {
    Config::query()->delete();
    $intervention = makeIntervention();
    expect(fn () => (new ServiceTarification())->calculerDevis($intervention, 0))
        ->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});
