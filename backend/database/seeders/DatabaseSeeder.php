<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Produit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ConfigSeeder::class,
            RolesAndPermissionsSeeder::class,
            TaxeSeeder::class,
            DeviseSeeder::class,
            NotifConfigSeeder::class,
            NotificationSeeder::class,
            StockSeeder::class,
            RetourVenteSeeder::class,
            HrmSeeder::class,
            ContratSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@dar-soins.com'],
            ['nom' => 'Gestionnaire Dar-Soins', 'password' => Hash::make('password'), 'role' => 'gestionnaire']
        );
        $roleGestionnaire = Role::where('name', 'gestionnaire')->first();
        if ($roleGestionnaire && !$admin->hasRole('gestionnaire')) {
            $admin->assignRole($roleGestionnaire);
        }

        $clientUser = User::firstOrCreate(
            ['email' => 'client@dar-soins.com'],
            ['nom' => 'Ahmed Client', 'password' => Hash::make('password'), 'role' => 'client']
        );
        Client::firstOrCreate(
            ['user_id' => $clientUser->id],
            ['adresse' => 'Quartier Hassan, Rabat']
        );
        $roleClient = Role::where('name', 'client')->first();
        if ($roleClient && !$clientUser->hasRole('client')) {
            $clientUser->assignRole($roleClient);
        }

        $infUser = User::firstOrCreate(
            ['email' => 'infirmier@dar-soins.com'],
            ['nom' => 'Karim Infirmier', 'password' => Hash::make('password'), 'role' => 'infirmier']
        );
        Infirmier::firstOrCreate(
            ['user_id' => $infUser->id],
            ['specialite' => 'Polyvalent', 'est_disponible' => true, 'latitude' => 34.020882, 'longitude' => -6.841650]
        );
        $roleInfirmier = Role::where('name', 'infirmier')->first();
        if ($roleInfirmier && !$infUser->hasRole('infirmier')) {
            $infUser->assignRole($roleInfirmier);
        }

        Produit::firstOrCreate(['nom' => 'Injection sous-cutanée'], ['type' => 'soin', 'prix_client' => 50, 'remuneration_soignant' => 30]);
        Produit::firstOrCreate(['nom' => 'Pansement complexe'], ['type' => 'soin', 'prix_client' => 100, 'remuneration_soignant' => 60]);
        Produit::firstOrCreate(['nom' => 'Garde-malade (Nuit)'], ['type' => 'garde', 'prix_client' => 400, 'remuneration_soignant' => null]);

        Produit::firstOrCreate(['nom' => 'Compresses Stériles'], ['type' => 'consommable', 'prix_client' => 2, 'prix_achat' => 1, 'stock_initial' => 450, 'gerer_stock' => true]);
        Produit::firstOrCreate(['nom' => 'Gants latex'], ['type' => 'consommable', 'prix_client' => 5, 'prix_achat' => 3, 'stock_initial' => 120, 'gerer_stock' => true]);
        Produit::firstOrCreate(['nom' => 'Seringues 5ml'], ['type' => 'consommable', 'prix_client' => 3, 'prix_achat' => 1.5, 'stock_initial' => 12, 'gerer_stock' => true]);
    }
}

