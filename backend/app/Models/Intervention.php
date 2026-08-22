<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Intervention extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'client_id',
        'infirmier_id',
        'produit_id',
        'localisation_id',
        'date_heure',
        'type',
        'duree_heures',
        'statut',
        'description_probleme',
        'fichier_joint',
        'notes_infirmier',
        'methode_paiement',
        'montant_recu',
        'signature_patient',
        'distance_manuelle',
        'tarif_km_manuel',
        'infirmiers_refuses_ids',
    ];

    protected $casts = [
        'infirmiers_refuses_ids' => 'array',
    ];

    public function ajouterInfirmierRefus(int $infirmierId): void
    {
        $refus = $this->infirmiers_refuses_ids ?? [];
        if (!in_array($infirmierId, $refus)) {
            $refus[] = $infirmierId;
            $this->infirmiers_refuses_ids = $refus;
            $this->save();
        }
    }

    public function getIgnoredInfirmiersIds(): array
    {
        return $this->infirmiers_refuses_ids ?? [];
    }

    public function client() {
        return $this->belongsTo(Client::class);
    }

    public function infirmier() {
        return $this->belongsTo(Infirmier::class);
    }

    public function produit() {
        return $this->belongsTo(Produit::class);
    }

    public function localisation() {
        return $this->belongsTo(Localisation::class);
    }

    public function consommations() {
        return $this->hasMany(Consommation::class);
    }

    public function constantes() {
        return $this->hasMany(ConstanteMedicale::class);
    }

    public function devis() {
        return $this->hasOne(Devis::class);
    }

    public function facture() {
        return $this->hasOne(Facture::class);
    }
}
