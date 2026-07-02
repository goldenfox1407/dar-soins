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
     */
    public function trouverInfirmierProche(Localisation $clientLoc, array $ignoredInfirmierIds = [])
    {
        $infirmiers = Infirmier::where('est_disponible', true)
                                ->whereNotIn('id', $ignoredInfirmierIds)
                                ->with(['user'])
                                ->get();
                                
        $closest = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($infirmiers as $inf) {
            // Priority 1: $inf->latitude / longitude from their GPS
            // For MVP, we default to Casablanca if still null
            $infLat = $inf->latitude ?? 33.5731;
            $infLon = $inf->longitude ?? -7.5898;
            
            $distance = $this->geolocalisation->calculerDistance(
                $clientLoc->latitude, $clientLoc->longitude,
                $infLat, $infLon
            );

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $closest = $inf;
            }
        }

        return [
            'infirmier' => $closest,
            'distance_km' => $minDistance
        ];
    }
}
