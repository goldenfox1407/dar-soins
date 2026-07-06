<?php

namespace App\Services;

use App\Models\Infirmier;
use App\Models\Localisation;

class ServiceAffectation
{
    protected $geolocalisation;

    public function __construct(ServiceGeolocalisation $geolocalisation)
    {
        $this->geolocalisation = $geolocalisation;
    }

    /**
     * Trouver l'infirmier disponible le plus proche
     * Seuls les infirmiers avec des coordonnées GPS valides sont pris en compte.
     */
    public function trouverInfirmierProche(Localisation $clientLoc, array $ignoredInfirmierIds = [])
    {
        $infirmiers = Infirmier::where('est_disponible', true)
                                ->whereNotIn('id', $ignoredInfirmierIds)
                                ->whereNotNull('latitude')
                                ->whereNotNull('longitude')
                                ->with(['user'])
                                ->get();
                                
        $closest = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($infirmiers as $inf) {
            $distance = $this->geolocalisation->calculerDistance(
                $clientLoc->latitude, $clientLoc->longitude,
                $inf->latitude, $inf->longitude
            );

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $closest = $inf;
            }
        }

        return [
            'infirmier' => $closest,
            'distance_km' => $closest ? round($minDistance, 2) : null
        ];
    }
}
