<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ajustement;
use App\Models\AjustementLigne;
use App\Models\Transfert;
use App\Models\TransfertLigne;
use App\Models\Produit;
use App\Models\Entrepot;
use App\Models\User;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'gestionnaire')->first();
        $entrepot1 = Entrepot::firstOrCreate(['nom' => 'Entrepôt Principal - Rabat'], ['localisation' => 'Agdal, Rabat', 'telephone' => '+212 537 000 111', 'est_principal' => true]);
        $entrepot2 = Entrepot::firstOrCreate(['nom' => 'Entrepôt Secondaire - Salé'], ['localisation' => 'Tabriquet, Salé', 'telephone' => '+212 537 000 222', 'est_principal' => false]);

        $p1 = Produit::first();
        $p2 = Produit::skip(1)->first() ?? $p1;

        if ($p1 && Ajustement::count() === 0) {
            $ajust = Ajustement::create([
                'reference' => 'REF-AJUST-00101',
                'entrepot_id' => $entrepot1->id,
                'date' => now()->toDateString(),
                'total_produits' => 2,
                'notes' => 'Ajustement suite au réinventaire physique mensuel',
                'user_id' => $admin?->id,
            ]);

            AjustementLigne::create([
                'ajustement_id' => $ajust->id,
                'produit_id' => $p1->id,
                'type' => 'add',
                'quantite' => 15,
            ]);

            if ($p2) {
                AjustementLigne::create([
                    'ajustement_id' => $ajust->id,
                    'produit_id' => $p2->id,
                    'type' => 'sub',
                    'quantite' => 2,
                ]);
            }
        }

        if ($p1 && Transfert::count() === 0) {
            $trans = Transfert::create([
                'reference' => 'REF-TRANS-00201',
                'entrepot_source_id' => $entrepot1->id,
                'entrepot_destination_id' => $entrepot2->id,
                'date' => now()->toDateString(),
                'statut' => 'complete',
                'total_produits' => 1,
                'notes' => 'Transfert de consommables pour renfort infirmier Salé',
                'user_id' => $admin?->id,
            ]);

            TransfertLigne::create([
                'transfert_id' => $trans->id,
                'produit_id' => $p1->id,
                'quantite' => 10,
            ]);
        }
    }
}
