<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$interventions = \App\Models\Intervention::all();
foreach($interventions as $i) {
    echo "ID: $i->id, Infirmier: $i->infirmier_id, Statut: $i->statut\n";
}
