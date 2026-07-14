<?php

namespace Database\Seeders;

use App\Models\Config;
use Illuminate\Database\Seeder;

class ConfigSeeder extends Seeder
{
    public function run(): void
    {
        Config::firstOrCreate([], [
            'tkmf_sm' => 2.5,
            'tva'     => 20,
        ]);
    }
}
