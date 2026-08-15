<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contrat;
use App\Models\Client;
use App\Models\Infirmier;
use App\Models\User;

class ContratSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'gestionnaire')->first();
        $client = Client::first();
        $infirmier = Infirmier::first();

        // Remove old sample contracts to refresh with official ready clauses
        Contrat::truncate();

        if ($client) {
            // Contrat 1: Garde de Nuit
            Contrat::create([
                'reference' => 'CTR-2026-0001',
                'client_id' => $client->id,
                'infirmier_id' => $infirmier?->id,
                'type_garde' => 'nuit',
                'date_debut' => now()->toDateString(),
                'date_fin' => now()->addDays(7)->toDateString(),
                'horaires_garde' => '20h00 - 08h00',
                'tarif_journalier' => 450.00,
                'montant_total' => 3600.00, // 8 jours * 450 MAD
                'statut' => 'actif',
                'prescriptions_medicales' => "1. Surveillance nocturne continue et assistance au coucher / lever.\n2. Administration du traitement médical du soir à 21h00 selon prescription.\n3. Prise et relevé des constantes vitales (Tension artérielle, Fréquence cardiaque, Température, Glycémie) à 22h00, 02h00 et 06h00.\n4. Surveillance de l'oxygénation et aide aux changements de position pour prévention des escarres.",
                'clauses_specifiques' => "Article 1 - Objet & Horaires : Le prestataire DAR-SOINS met à disposition un(e) infirmier(ère) qualifié(e) pour assurer la garde de nuit de 20h00 à 08h00.\nArticle 2 - Continuité des soins : L'infirmier(ère) s'engage à assurer une présence vigilante continue sans interruption, et à administrer les prescriptions médicales validées par le médecin traitant.\nArticle 3 - Protocole d'Urgence : En cas d'altération brutale de l'état clinique ou de détresse vitale, l'infirmier(ère) contacte immédiatement le médecin régulateur / SAMU (141) et avertit la famille référente.\nArticle 4 - Hygiène et Déontologie : Respect strict des règles d'asepsie, du secret médical et de l'intimité du patient.\nArticle 5 - Modification et Préavis : Toute modification de planning ou annulation nécessite un préavis minimum de 24 heures.",
                'user_id' => $admin?->id,
            ]);

            // Contrat 2: Garde Continu 24h/24 Accompagnement Senior
            Contrat::create([
                'reference' => 'CTR-2026-0002',
                'client_id' => $client->id,
                'infirmier_id' => $infirmier?->id,
                'type_garde' => '24h',
                'date_debut' => now()->subDays(2)->toDateString(),
                'date_fin' => now()->addDays(12)->toDateString(),
                'horaires_garde' => "24h / 24 (Relève 2 infirmiers 08h-20h / 20h-08h)",
                'tarif_journalier' => 900.00,
                'montant_total' => 13500.00, // 15 jours * 900 MAD
                'statut' => 'actif',
                'prescriptions_medicales' => "1. Surveillance médicale continue 24h/24 avec relève soignante à 08h00 et 20h00.\n2. Soins d'hygiène complets, prévention rigoureuse des escarres (changements de position toutes les 3h).\n3. Administration des traitements oraux et injectables selon protocole médical strict.\n4. Surveillance de la diurèse, du transit et des apports hydriques journaliers.\n5. Relevé continu des constantes (Tension, SpO2, Pouls, Glycémie).",
                'clauses_specifiques' => "Article 1 - Prestation Continue 24h/24 : Présence ininterrompue au chevet du patient assurée par un binôme d'infirmiers en rotation coordonnée par DAR-SOINS.\nArticle 2 - Cahier de Transmission Médicale : Transmission obligatoire et consignation écrite des observations cliniques entre les équipes soignantes.\nArticle 3 - Remplacement Immédiat : En cas d'indisponibilité fortuite d'un soignant, DAR-SOINS garantit son remplacement sous un délai maximal de 2 heures.\nArticle 4 - Sécurité & Matériel : Le patient ou sa famille met à disposition l'ordonnance médicale valide et les dispositifs médicaux prescrits.\nArticle 5 - Facturation & Paiement : Règlement hebdomadaire ou mensuel selon les modalités convenues lors de la signature.",
                'user_id' => $admin?->id,
            ]);
        }
    }
}
