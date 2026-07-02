<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// We need an active intervention again. 11 is now terminee!
$intervention = \App\Models\Intervention::find(11);
$intervention->statut = 'en_cours';
$intervention->save();
$user = $intervention->infirmier->user;

\Illuminate\Support\Facades\Auth::login($user);

$request = \Illuminate\Http\Request::create('/api/interventions/'.$intervention->id.'/cloturer', 'POST', [
    'notes_infirmier' => 'Test',
    'methode_paiement' => 'espece',
    'montant_recu' => 100,
    'consommations' => [
        [ 'produit_id' => 1, 'quantite' => 2 ]
    ]
]);
$request->setUserResolver(function() use ($user) { return $user; });

$controller = $app->make(\App\Http\Controllers\InterventionController::class);

try {
    $response = $controller->cloturerIntervention($request, $intervention->id);
    echo $response->getContent();
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "Validation error:\n";
    print_r($e->errors());
} catch (\Exception $e) {
    echo $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine();
}
