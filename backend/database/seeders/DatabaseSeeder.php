<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use App\Models\Produit;
use App\Models\Materiel;
use App\Models\Localisation;
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
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@dar-soins.com'],
            ['nom' => 'Gestionnaire Dar-Soins', 'password' => Hash::make('password'), 'role' => 'gestionnaire']
        );
        Gestionnaire::firstOrCreate(['user_id' => $admin->id]);
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
        Localisation::firstOrCreate(['latitude' => 34.020882, 'longitude' => -6.841650]);
        Infirmier::firstOrCreate(
            ['user_id' => $infUser->id],
            ['specialite' => 'Polyvalent', 'est_disponible' => true]
        );
        $roleInfirmier = Role::where('name', 'infirmier')->first();
        if ($roleInfirmier && !$infUser->hasRole('infirmier')) {
            $infUser->assignRole($roleInfirmier);
        }

        Produit::firstOrCreate(['nom' => 'Injection sous-cutanée'], ['type' => 'soin', 'prix_client' => 50, 'remuneration_soignant' => 30]);
        Produit::firstOrCreate(['nom' => 'Pansement complexe'], ['type' => 'soin', 'prix_client' => 100, 'remuneration_soignant' => 60]);
        Produit::firstOrCreate(['nom' => 'Garde-malade (Nuit)'], ['type' => 'garde', 'prix_client' => 400, 'remuneration_soignant' => null]);

        Materiel::firstOrCreate(['nom' => 'Compresses Stériles'], ['stock_actuel' => 450, 'prix_unitaire' => 2]);
        Materiel::firstOrCreate(['nom' => 'Gants latex'], ['stock_actuel' => 120, 'prix_unitaire' => 5]);
        Materiel::firstOrCreate(['nom' => 'Seringues 5ml'], ['stock_actuel' => 12, 'prix_unitaire' => 3]);
    }
}

