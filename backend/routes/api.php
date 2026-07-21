<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\TaxeController;
use App\Http\Controllers\DeviseController;
use App\Http\Controllers\NotifConfigController;
use Illuminate\Http\Response;

// Rate Limiting Configuration
RateLimiter::for('api', function (Request $request) {
    return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('auth', function (Request $request) {
    return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->ip());
});

// Public routes with rate limiting
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

// Public routes
Route::get('/produits', [App\Http\Controllers\ProduitController::class, 'index']);

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    
    // Interventions (accessible par client et infirmier)
    Route::get('/interventions', [App\Http\Controllers\InterventionController::class, 'index']);
    Route::post('/interventions/commander', [App\Http\Controllers\InterventionController::class, 'commanderSoin']);
    Route::post('/interventions/{id}/cloturer', [App\Http\Controllers\InterventionController::class, 'cloturerIntervention']);
    Route::post('/interventions/{id}/reponse-client', [\App\Http\Controllers\InterventionController::class, 'repondreDevisClient']);
    Route::post('/interventions/{id}/reponse-infirmier', [\App\Http\Controllers\InterventionController::class, 'repondreInfirmier']);
    Route::post('/interventions/{id}/arriver', [\App\Http\Controllers\InterventionController::class, 'arriverSurSite']);

    // Factures (accessible par les utilisateurs authentifiés)
    Route::get('/factures', [App\Http\Controllers\FactureController::class, 'index']);
    Route::get('/factures/{id}/pdf', [App\Http\Controllers\FactureController::class, 'genererPdf']);

    // Personnel
    Route::get('/personnel', [App\Http\Controllers\PersonnelController::class, 'index']);

    // =====================================================================
    // NOTIFICATIONS (accessible par tous les utilisateurs authentifiés)
    // =====================================================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread', [NotificationController::class, 'unread']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{id}/mark-read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::delete('/clear-read', [NotificationController::class, 'clearRead']);
    });

    // Tâches d'organisation (accessible par tous, mais filtrage par rôle côté contrôleur)
    Route::apiResource('taches', TacheController::class);
    Route::get('/planning', [TacheController::class, 'planning']);
    Route::get('/organisation/stats', [TacheController::class, 'stats']);

    // User Management (Stocky Clone)
    Route::apiResource('users', App\Http\Controllers\UserController::class);
    Route::apiResource('roles', App\Http\Controllers\RoleController::class);
    Route::apiResource('permissions', App\Http\Controllers\PermissionController::class)->only(['index']);

    // Gestionnaire-only Routes
    Route::middleware('role:gestionnaire')->group(function () {
        // Admin Produit Routes (CRUD sauf index qui est public)
        Route::post('/produits', [App\Http\Controllers\ProduitController::class, 'store']);
        Route::put('/produits/{id}', [App\Http\Controllers\ProduitController::class, 'update']);
        Route::delete('/produits/{id}', [App\Http\Controllers\ProduitController::class, 'destroy']);

        // ERP Routes Generated
        Route::apiResource('comptes-bancaires', \App\Http\Controllers\CompteBancaireController::class);
        Route::apiResource('clients', \App\Http\Controllers\ClientController::class);
        Route::apiResource('fournisseurs', \App\Http\Controllers\FournisseurController::class);
        Route::apiResource('categories', \App\Http\Controllers\CategorieController::class);
        Route::apiResource('marques', \App\Http\Controllers\MarqueController::class);
        Route::apiResource('unites', \App\Http\Controllers\UniteController::class);
        Route::apiResource('unites-bases', \App\Http\Controllers\UniteBaseController::class);
        Route::apiResource('variations', \App\Http\Controllers\VariationController::class);
        Route::apiResource('entrepots', \App\Http\Controllers\EntrepotController::class);
        Route::apiResource('achats', \App\Http\Controllers\AchatController::class);
        Route::get('achats/{achat}/pdf', [\App\Http\Controllers\AchatController::class, 'generatePDF']);
        Route::get('achats/{achat}/labels', [\App\Http\Controllers\AchatController::class, 'printLabels']);
        Route::post('achats/{achat}/upload', [\App\Http\Controllers\AchatController::class, 'uploadDocument']);
        Route::post('achats/{achat}/notify', [\App\Http\Controllers\AchatController::class, 'sendNotification']);
        Route::get('achats/{achat}/paiements', [\App\Http\Controllers\AchatController::class, 'getPaiements']);
        Route::post('achats/{achat}/paiements', [\App\Http\Controllers\AchatController::class, 'storePaiement']);
        Route::post('achats/{achat}/retourner', [\App\Http\Controllers\AchatController::class, 'marquerRetourne']);
        Route::apiResource('achat-lignes', \App\Http\Controllers\AchatLigneController::class);
        Route::apiResource('retour-achats', \App\Http\Controllers\RetourAchatController::class);
        Route::apiResource('ventes', \App\Http\Controllers\VenteController::class);

        // New Routes for Workflow V2
        Route::get('/interventions/{id}/infirmiers-proches', [\App\Http\Controllers\InterventionController::class, 'infirmiersProches']);
        Route::post('/interventions/{id}/affecter-manuellement', [\App\Http\Controllers\InterventionController::class, 'affecterManuellement']);
        Route::post('/interventions/{id}/generer-devis', [\App\Http\Controllers\InterventionController::class, 'genererDevis']);
        Route::post('/interventions/{id}/envoyer-devis', [\App\Http\Controllers\InterventionController::class, 'envoyerDevis']);

        Route::get('/devis/{id}/pdf', [\App\Http\Controllers\DevisController::class, 'telechargerPdf']);
        Route::apiResource('devis', \App\Http\Controllers\DevisController::class);
        Route::apiResource('vente-lignes', \App\Http\Controllers\VenteLigneController::class);
        Route::apiResource('employes', \App\Http\Controllers\EmployeController::class);
        Route::apiResource('presences', \App\Http\Controllers\PresenceController::class);
        Route::apiResource('compte-bancaires', \App\Http\Controllers\CompteBancaireController::class);
        Route::apiResource('transaction-financieres', \App\Http\Controllers\TransactionFinanciereController::class);

        // Parametres
        Route::get('parametres', [ParametreController::class, 'show']);
        Route::put('parametres', [ParametreController::class, 'update']);
        Route::post('parametres/logo', [ParametreController::class, 'uploadLogo']);

        // Taxes
        Route::apiResource('taxes', TaxeController::class);

        // Devises
        Route::apiResource('devises', DeviseController::class);

        // Notifications config
        Route::get('notif-configs', [NotifConfigController::class, 'index']);
        Route::put('notif-configs/{notifConfig}', [NotifConfigController::class, 'update']);
        Route::patch('notif-configs/{notifConfig}/toggle', [NotifConfigController::class, 'toggle']);

        // =====================================================================
        // RAPPORTS & IA (gestionnaire only)
        // =====================================================================
        Route::prefix('rapports')->group(function () {
            Route::get('/synthese', [RapportController::class, 'synthese']);
            Route::get('/stock', [RapportController::class, 'stock']);
            Route::get('/ventes', [RapportController::class, 'ventes']);
            Route::get('/achats', [RapportController::class, 'achats']);
            Route::get('/interventions', [RapportController::class, 'interventions']);
            Route::get('/finances', [RapportController::class, 'finances']);
            Route::get('/ia/synthese', [RapportController::class, 'iaSynthese']);
            Route::get('/ia/anomalies', [RapportController::class, 'iaAnomalies']);
            Route::get('/ia/previsions', [RapportController::class, 'iaPrevisions']);
            Route::get('/ia/recommandations', [RapportController::class, 'iaRecommandations']);
            Route::get('/export/{type}', [RapportController::class, 'export']);
        });
    });
});

