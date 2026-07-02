<?php

namespace App\Services;

class ServiceGeolocalisation
{
    /**
     * Calculates the great-circle distance between two points, with
     * the Haversine formula.
     * @return float Distance in kilometers
     */
    public function calculerDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * asin(sqrt($a));
        
        return $earthRadius * $c;
    }
}
