<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Les modules de l'ERP
        $modules = [
            'tableau_de_bord',
            'contacts',
            'utilisateurs',
            'roles',
            'permissions',
            'produits',
            'stocks',
            'achats',
            'ventes',
            'devis',
            'rh',
            'comptabilite',
            'services',
            'taches',
            'rapports',
            'parametres'
        ];

        // Création de toutes les permissions
        foreach ($modules as $module) {
            Permission::create(['name' => "voir_$module", 'guard_name' => 'web']);
            Permission::create(['name' => "ajouter_$module", 'guard_name' => 'web']);
            Permission::create(['name' => "modifier_$module", 'guard_name' => 'web']);
            Permission::create(['name' => "supprimer_$module", 'guard_name' => 'web']);
        }

        // Créer les rôles et assigner les permissions
        
        // 1. Gestionnaire (Admin - a tout)
        $roleGestionnaire = Role::create(['name' => 'gestionnaire']);
        $roleGestionnaire->givePermissionTo(Permission::all());

        // 2. Infirmier (accès limité)
        $roleInfirmier = Role::create(['name' => 'infirmier']);
        $roleInfirmier->givePermissionTo([
            'voir_tableau_de_bord',
            'voir_contacts',
            'voir_produits',
            'voir_taches',
            'ajouter_taches',
            'modifier_taches'
        ]);

        // 3. Client
        $roleClient = Role::create(['name' => 'client']);
        $roleClient->givePermissionTo([
            'voir_tableau_de_bord',
            'voir_taches'
        ]);

        // Attacher les rôles aux utilisateurs existants (créés par DatabaseSeeder)
        $users = User::all();
        foreach ($users as $user) {
            if ($user->role === 'gestionnaire') {
                $user->assignRole($roleGestionnaire);
            } elseif ($user->role === 'infirmier') {
                $user->assignRole($roleInfirmier);
            } elseif ($user->role === 'client') {
                $user->assignRole($roleClient);
            }
        }
    }
}
