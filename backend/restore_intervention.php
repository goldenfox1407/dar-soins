<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
\App\Models\Facture::where('intervention_id', 11)->delete();
$i = \App\Models\Intervention::find(11);
if ($i) {
    $i->statut = 'en_cours';
    $i->save();
    echo "RESTORED";
}
