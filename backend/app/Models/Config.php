<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Config extends Model
{
    protected $fillable = [
        'tkmf_sm', 'tva',
        // Identité
        'nom_entreprise', 'slogan', 'email_contact', 'telephone', 'adresse',
        'ville', 'code_postal', 'pays', 'site_web', 'logo_path',
        // Légal
        'rc', 'ice', 'if_fiscal', 'patente', 'cnss',
        // Opérationnel
        'rayon_intervention_km', 'delai_reponse_devis_h', 'delai_validite_devis_j', 'commission_infirmier',
        // Facturation
        'devise_defaut', 'format_date', 'mentions_facture', 'conditions_paiement', 'pied_facture',
        // Numérotation
        'prefix_facture', 'prefix_devis', 'prefix_achat', 'prefix_vente', 'prefix_avoir',
        'compteur_facture', 'compteur_devis', 'compteur_achat', 'compteur_vente', 'format_numero',
    ];
}
