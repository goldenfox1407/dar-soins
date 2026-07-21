<?php

namespace App\Services;

use App\Models\Config;
use Illuminate\Support\Facades\DB;

class ServiceNumerotation
{
    /**
     * Genere un numero de reference unique et incremente le compteur atomiquement.
     *
     * @param string $type  'facture' | 'devis' | 'achat' | 'vente' | 'avoir'
     * @return string ex: 'FAC-20260714-0042'
     */
    public function generer(string $type): string
    {
        return DB::transaction(function () use ($type) {
            // Lecture + lock pessimiste pour eviter les doublons en concurrent
            $config = Config::lockForUpdate()->firstOrFail();

            $prefixKey   = "prefix_{$type}";
            $compteurKey = "compteur_{$type}";

            $prefix   = $config->$prefixKey   ?? strtoupper(substr($type, 0, 3));
            $compteur = (int)($config->$compteurKey ?? 1);
            $format   = $config->format_numero ?? 'PREFIX-YYYYMMDD-NNNN';

            $reference = $this->formater($prefix, $compteur, $format);

            // Incremente le compteur en DB
            $config->$compteurKey = $compteur + 1;
            $config->save();

            return $reference;
        });
    }

    /**
     * Formate la reference selon le pattern configure.
     */
    private function formater(string $prefix, int $compteur, string $format): string
    {
        $year    = date('Y');
        $date    = date('Ymd');
        $num4    = sprintf('%04d', $compteur);
        $num6    = sprintf('%06d', $compteur);

        return match ($format) {
            'PREFIX-YYYY-NNNN'     => "{$prefix}-{$year}-{$num4}",
            'PREFIX-NNNNNN'        => "{$prefix}-{$num6}",
            default                => "{$prefix}-{$date}-{$num4}", // PREFIX-YYYYMMDD-NNNN
        };
    }
}
