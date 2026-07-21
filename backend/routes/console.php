<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vérification quotidienne des stocks bas (déclenche les notifications stock_alerte)
Schedule::command('darsoins:check-stock-alertes')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->description('Vérification quotidienne des stocks bas');

// Nettoyage hebdomadaire des notifications anciennes (> 90 jours)
Schedule::command('notifications:clean --days=90')
    ->weekly()
    ->sundays()
    ->at('02:00')
    ->description('Nettoyage hebdomadaire des notifications anciennes');

