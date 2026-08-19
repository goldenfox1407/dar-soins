<?php

namespace App\Services;

use App\Models\Intervention;
use App\Models\Config;
use App\Models\Devis;
use App\Models\Facture;
use App\Services\ServiceNumerotation;

class ServiceTarification
{
    /**
     * Logique commune de calcul du prix de base d'un soin
     *
     * @return array{prix_soin: float, frais_deplacement: float, montant_ht: float, montant_ttc: float, config: Config}
     */
    private function calculerBaseSoin(Intervention $intervention, float $distanceKm = 0): array
    {
        $config = Config::first() ?? new Config();
        
        $produit = $intervention->produit;
        $prixSoin = (float)($produit ? $produit->prix_client : 0);
        
        // Application de la remise
        if ($produit && $produit->type_remise === 'percent' && $produit->valeur_remise > 0) {
            $prixSoin -= $prixSoin * ($produit->valeur_remise / 100);
        } elseif ($produit && $produit->type_remise === 'fixed' && $produit->valeur_remise > 0) {
            $prixSoin -= (float)$produit->valeur_remise;
        }
        $prixSoin = max(0, $prixSoin);

        // For garde_malade, multiply by hours
        if ($intervention->type === 'garde_malade' && $intervention->duree_heures > 0) {
            $prixSoin *= (float)$intervention->duree_heures;
        }

        $tarifKm = (float)($intervention->tarif_km_manuel !== null ? $intervention->tarif_km_manuel : ($config->tkmf_sm ?? 2.5));
        $fraisDeplacement = round((float)$distanceKm * $tarifKm, 2);
        $prixSoin = round($prixSoin, 2);

        $montantTTC = round($prixSoin + $fraisDeplacement, 2);
        $tvaRate = (float)($config->tva ?? 20);
        $montantHT = round($montantTTC / (1 + ($tvaRate / 100)), 2);

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
        $calcul = $this->calculerBaseSoin($intervention, (float)$distanceKm);

        $devis = Devis::updateOrCreate(
            ['intervention_id' => $intervention->id],
            [
                'montant_estime' => $calcul['montant_ttc'],
                'frais_deplacement' => $calcul['frais_deplacement'],
                'statut' => 'genere',
                'date' => now()
            ]
        );

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

        $montantTTC = $calcul['prix_soin'] + $calcul['frais_deplacement'] + $coutMateriels;
        $montantHT = $montantTTC / (1 + ($calcul['config']->tva / 100));

        $numerotation = new ServiceNumerotation();
        $reference = $numerotation->generer('facture');

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
