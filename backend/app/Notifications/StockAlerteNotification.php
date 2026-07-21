<?php

namespace App\Notifications;

class StockAlerteNotification extends BaseNotification
{
    public function getTitre(): string
    {
        $produit = $this->payload['produit'] ?? null;
        $nom = $produit['nom'] ?? ($produit?->nom ?? 'produit');

        return "Stock bas - {$nom}";
    }

    public function getMessage(): string
    {
        $data = $this->payload;
        $nom = $data['produit']['nom'] ?? ($data['produit']?->nom ?? 'produit');
        $quantite = $data['quantite'] ?? 0;
        $seuil = $data['seuil'] ?? 0;

        return sprintf(
            'Le stock de "%s" est en dessous du seuil d\'alerte (%d unités restantes, seuil: %d).',
            $nom,
            $quantite,
            $seuil
        );
    }

    public function getIcone(): string
    {
        return 'package';
    }

    public function getCouleur(): string
    {
        return '#F59E0B'; // amber-500
    }

    public function getUrlCible(): ?string
    {
        $produitId = $this->payload['produit']['id'] ?? ($this->payload['produit']?->id ?? null);
        if ($produitId) {
            return "/gestionnaire/produits/{$produitId}";
        }

        return '/gestionnaire/stocks';
    }
}
