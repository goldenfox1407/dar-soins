<?php

namespace App\Services;

use App\Models\Intervention;
use App\Models\Config;
use App\Models\Devis;
use App\Models\Facture;

class ServiceTarification
{
    public function calculerDevis(Intervention $intervention, $distanceKm = 0)
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
        
        // For garde_malade, we might multiply by hours
        if ($intervention->type === 'garde_malade' && $intervention->duree_heures) {
            $prixSoin *= $intervention->duree_heures;
        }

        $montantHT = $prixSoin + $fraisDeplacement;
        $montantTTC = $montantHT * (1 + ($config->tva / 100));

        $devis = Devis::create([
            'intervention_id' => $intervention->id,
            'montant_estime' => $montantTTC,
            'frais_deplacement' => $fraisDeplacement,
            'statut' => 'genere',
            'date' => now()
        ]);

        return $devis;
    }

    /**
     * Calculer la facture finale (inclus les matériels consommés)
     */
    public function calculerFacture(Intervention $intervention, $distanceKm = 0)
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
        
        if ($intervention->type === 'garde_malade' && $intervention->duree_heures) {
            $prixSoin *= $intervention->duree_heures;
        }

        // Add consumables (now linked to produit)
        $coutMateriels = 0;
        foreach ($intervention->consommations as $conso) {
            if ($conso->produit) {
                $coutMateriels += ($conso->quantite * $conso->produit->prix_client);
            }
        }

        $montantHT = $prixSoin + $fraisDeplacement + $coutMateriels;
        $montantTTC = $montantHT * (1 + ($config->tva / 100));

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
