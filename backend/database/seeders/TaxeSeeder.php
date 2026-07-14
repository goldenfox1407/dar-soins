<?php

namespace Database\Seeders;

use App\Models\Taxe;
use Illuminate\Database\Seeder;

class TaxeSeeder extends Seeder
{
    public function run(): void
    {
        $taxes = [
            ['nom' => 'TVA Standard',  'taux' => 20.00, 'type' => 'percent', 'est_defaut' => true,  'description' => 'Taux normal de TVA au Maroc'],
            ['nom' => 'TVA Réduite',   'taux' => 10.00, 'type' => 'percent', 'est_defaut' => false, 'description' => 'Taux réduit applicable aux soins paramédicaux'],
            ['nom' => 'Exonéré',       'taux' => 0.00,  'type' => 'percent', 'est_defaut' => false, 'description' => 'Exonération de TVA'],
        ];

        foreach ($taxes as $taxe) {
            Taxe::firstOrCreate(['nom' => $taxe['nom']], $taxe);
        }
    }
}
