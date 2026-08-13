<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RetourVente;
use App\Models\RetourVenteLigne;
use App\Models\Vente;
use App\Models\Client;
use App\Models\Entrepot;
use App\Models\Produit;
use App\Models\User;

class RetourVenteSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'gestionnaire')->first();
        $client = Client::first();
        $entrepot = Entrepot::first();
        $produit = Produit::first();

        if ($produit && RetourVente::count() === 0) {
            $retour = RetourVente::create([
                'reference' => 'REF-RETV-00301',
                'vente_id' => Vente::first()?->id,
                'client_id' => $client?->id,
                'entrepot_id' => $entrepot?->id,
                'statut' => 'complete',
                'montant_total' => $produit->prix_client * 2,
                'notes' => 'Retour de 2 unités suite à l\'annulation partielle par le client',
                'user_id' => $admin?->id,
            ]);

            RetourVenteLigne::create([
                'retour_vente_id' => $retour->id,
                'produit_id' => $produit->id,
                'quantite' => 2,
                'prix_unitaire' => $produit->prix_client,
                'sous_total' => $produit->prix_client * 2,
            ]);
        }
    }
}
