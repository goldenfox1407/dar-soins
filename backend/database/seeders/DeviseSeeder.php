<?php

namespace Database\Seeders;

use App\Models\Devise;
use Illuminate\Database\Seeder;

class DeviseSeeder extends Seeder
{
    public function run(): void
    {
        $devises = [
            ['code' => 'MAD', 'nom' => 'Dirham Marocain',    'symbole' => 'د.م.', 'taux_change' => 1.0000,  'est_defaut' => true],
            ['code' => 'EUR', 'nom' => 'Euro',                'symbole' => '€',    'taux_change' => 10.8500, 'est_defaut' => false],
            ['code' => 'USD', 'nom' => 'Dollar Américain',   'symbole' => '$',    'taux_change' => 9.9800,  'est_defaut' => false],
            ['code' => 'GBP', 'nom' => 'Livre Sterling',     'symbole' => '£',    'taux_change' => 12.6000, 'est_defaut' => false],
            ['code' => 'SAR', 'nom' => 'Riyal Saoudien',     'symbole' => '﷼',    'taux_change' => 2.6600,  'est_defaut' => false],
            ['code' => 'AED', 'nom' => 'Dirham Émirati',     'symbole' => 'د.إ',  'taux_change' => 2.7200,  'est_defaut' => false],
        ];

        foreach ($devises as $devise) {
            Devise::firstOrCreate(['code' => $devise['code']], $devise);
        }
    }
}
