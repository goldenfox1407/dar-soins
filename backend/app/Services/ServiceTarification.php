<?php

namespace App\Services;

use App\Models\Intervention;
use App\Models\Config;
use App\Models\Devis;
use App\Models\Facture;

class ServiceTarification
{
    /**
     * Logique commune de calcul du prix de base d'un soin
     *
     * @return array{prix_soin: float, frais_deplacement: float, montant_ht: float, montant_ttc: float, config: Config}
     */
    private function calculerBaseSoin(Intervention $intervention, float $distanceKm = 0): array
    {
        $config = Config::first() ?? Config::create(['tkmf_sm' => 2.5, 'tva' => 20]);
        
        $produit = $intervention->produit;
        $prixSoin = $produit->prix_client;
        
        // Application de la remise
        if ($produit->type_remise === 'percent') {
            $prixSoin -= $prixSoin * ($produit->valeur_remise / 100);
        } elseif ($produit->type_remise === 'fixed') {
            $prixSoin -= $produit->valeur_remise;
        }

        $tarifKm = $intervention->tarif_km_manuel !== null ? $intervention->tarif_km_manuel : $config->tkmf_sm;
        $fraisDeplacement = $distanceKm * $tarifKm;
        
        // For garde_malade, multiply by hours
        if ($intervention->type === 'garde_malade' && $intervention->duree_heures) {
            $prixSoin *= $intervention->duree_heures;
        }

        $montantHT = $prixSoin + $fraisDeplacement;
        $montantTTC = $montantHT * (1 + ($config->tva / 100));

        return [
            'prix_soin' => $prixSoin,
            'frais_deplacement' => $fraisDeplacement,
            'montant_ht' => $montantHT,
            'montant_ttc' => $montantTTC,
            'config' => $config,
        ];
    }

    /**
     * Calculer le devis estimatif (avant intervention)
     */
    public function calculerDevis(Intervention $intervention, $distanceKm = 0)
    {
        $calcul = $this->calculerBaseSoin($intervention, $distanceKm);

        $devis = Devis::create([
            'intervention_id' => $intervention->id,
            'montant_estime' => $calcul['montant_ttc'],
            'frais_deplacement' => $calcul['frais_deplacement'],
            'statut' => 'genere',
            'date' => now()
        ]);

        return $devis;
    }

    /**
     * Calculer la facture finale (inclut les matériels consommés)
     */
    public function calculerFacture(Intervention $intervention, $distanceKm = 0)
    {
        $calcul = $this->calculerBaseSoin($intervention, $distanceKm);

        // Ajouter le coût des consommables réels
        $coutMateriels = 0;
        foreach ($intervention->consommations as $conso) {
            if ($conso->produit) {
                $coutMateriels += ($conso->quantite * $conso->produit->prix_client);
            }
        }

        $montantHT = $calcul['prix_soin'] + $calcul['frais_deplacement'] + $coutMateriels;
        $montantTTC = $montantHT * (1 + ($calcul['config']->tva / 100));

        $reference = 'FAC-' . date('Ymd') . '-' . sprintf('%04d', $intervention->id);

        $facture = Facture::updateOrCreate(
            ['intervention_id' => $intervention->id],
            [
                'reference' => $reference,
                'montant_total' => $montantTTC,
            ]
        );

        return $facture;
    }
}
