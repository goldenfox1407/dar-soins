<?php

namespace App\Console\Commands;

use App\Models\Produit;
use App\Services\ServiceNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckStockAlertes extends Command
{
    protected $signature = 'darsoins:check-stock-alertes';
    protected $description = 'Vérifie les stocks bas et déclenche les notifications stock_alerte';

    public function handle(): int
    {
        $this->info('Vérification des stocks bas...');

        $compteur = 0;

        // Pour chaque produit avec stock géré
        $produits = Produit::where('gerer_stock', true)
            ->whereNotNull('quantite_alerte')
            ->where('quantite_alerte', '>', 0)
            ->get();

        foreach ($produits as $produit) {
            // Calcul du stock total tous entrepôts confondus
            $stockTotal = $produit->entrepots()->sum('pivot.quantite') ?? $produit->stock_initial ?? 0;
            $seuil = $produit->quantite_alerte;

            if ($stockTotal <= $seuil) {
                try {
                    ServiceNotification::dispatcher('stock_alerte', [
                        'produit'   => $produit,
                        'quantite'  => $stockTotal,
                        'seuil'     => $seuil,
                    ]);

                    $compteur++;
                    $this->line("  ⚠ Stock bas: {$produit->nom} ({$stockTotal}/{$seuil})");
                } catch (\Throwable $e) {
                    Log::error("Erreur notification stock_alerte pour produit #{$produit->id}: ".$e->getMessage());
                }
            }
        }

        $this->info("Terminé. {$compteur} alerte(s) envoyée(s).");

        return self::SUCCESS;
    }
}
