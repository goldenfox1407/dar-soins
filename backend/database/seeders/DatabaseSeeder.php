<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\Gestionnaire;
use App\Models\Produit;
use App\Models\Materiel;
use App\Models\Localisation;
use App\Models\Config;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Config
        Config::create(['tkmf_sm' => 2.5, 'tva' => 20]);

        // Admin
        $admin = User::create([
            'nom' => 'Gestionnaire Dar-Soins',
            'email' => 'admin@dar-soins.com',
            'password' => Hash::make('password'),
            'role' => 'gestionnaire',
        ]);
        Gestionnaire::create(['user_id' => $admin->id]);

        // Client
        $clientUser = User::create([
            'nom' => 'Ahmed Client',
            'email' => 'client@dar-soins.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);
        Client::create(['user_id' => $clientUser->id, 'adresse' => 'Quartier Hassan, Rabat']);

        // Infirmier
        $infUser = User::create([
            'nom' => 'Karim Infirmier',
            'email' => 'infirmier@dar-soins.com',
            'password' => Hash::make('password'),
            'role' => 'infirmier',
        ]);
        $loc = Localisation::create(['latitude' => 34.020882, 'longitude' => -6.841650]);
        Infirmier::create([
            'user_id' => $infUser->id, 
            'specialite' => 'Polyvalent', 
            'est_disponible' => true
        ]);

        // Produits
        Produit::create([
            'nom' => 'Injection sous-cutanée', 
            'type' => 'soin', 
            'prix_client' => 50, 
            'remuneration_soignant' => 30
        ]);
        Produit::create([
            'nom' => 'Pansement complexe', 
            'type' => 'soin', 
            'prix_client' => 100, 
            'remuneration_soignant' => 60
        ]);
        Produit::create([
            'nom' => 'Garde-malade (Nuit)', 
            'type' => 'garde', 
            'prix_client' => 400, 
            'remuneration_soignant' => null // Salaire fixe
        ]);

        // Materiels
        Materiel::create(['nom' => 'Compresses Stériles', 'stock_actuel' => 450, 'prix_unitaire' => 2]);
        Materiel::create(['nom' => 'Gants latex', 'stock_actuel' => 120, 'prix_unitaire' => 5]);
        Materiel::create(['nom' => 'Seringues 5ml', 'stock_actuel' => 12, 'prix_unitaire' => 3]);
        
        // Roles and Permissions
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);
    }
}
