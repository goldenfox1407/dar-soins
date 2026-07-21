<?php

namespace App\Services;

use App\Models\Achat;
use App\Models\Facture;
use App\Models\Intervention;
use App\Models\Produit;
use App\Models\Vente;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service d'agrégation des données pour les rapports Dar-Soins.
 * Toutes les méthodes retournent des tableaux prêts à être consommés par le frontend (graphiques Recharts).
 */
class ServiceRapport
{
    /**
     * Synthèse globale (KPIs pour dashboard).
     */
    public function synthese(): array
    {
        $now = now();
        $debutMois = $now->copy()->startOfMonth();
        $finMois = $now->copy()->endOfMonth();
        $debutMoisPrecedent = $now->copy()->subMonth()->startOfMonth();
        $finMoisPrecedent = $now->copy()->subMonth()->endOfMonth();

        // Interventions
        $interventionsTotal = Intervention::count();
        $interventionsMois = Intervention::whereBetween('created_at', [$debutMois, $finMois])->count();
        $interventionsMoisPrec = Intervention::whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])->count();

        // Revenus (factures)
        $revenusMois = Facture::whereBetween('created_at', [$debutMois, $finMois])->sum('montant_total');
        $revenusMoisPrec = Facture::whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])->sum('montant_total');

        // Achats
        $achatsMois = Achat::whereBetween('created_at', [$debutMois, $finMois])->sum('montant_total');
        $achatsMoisPrec = Achat::whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])->sum('montant_total');

        // Ventes
        $ventesMois = Vente::whereBetween('created_at', [$debutMois, $finMois])->sum('montant_total');
        $ventesMoisPrec = Vente::whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])->sum('montant_total');

        // Clients
        $clientsTotal = \App\Models\Client::count();
        $clientsMois = \App\Models\Client::whereBetween('created_at', [$debutMois, $finMois])->count();

        // Infirmiers
        $infirmiersTotal = \App\Models\Infirmier::count();
        $infirmiersDispo = \App\Models\Infirmier::where('est_disponible', true)->count();

        // Évolution des revenus 6 derniers mois
        $evolutionRevenus = $this->evolutionRevenus(6);

        // Top 5 produits les plus demandés
        $topProduits = Intervention::selectRaw('produit_id, COUNT(*) as count')
            ->with('produit:id,nom')
            ->whereNotNull('produit_id')
            ->groupBy('produit_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($i) => ['nom' => $i->produit?->nom ?? 'N/A', 'count' => $i->count])
            ->toArray();

        return [
            'periode' => [
                'debut' => $debutMois->toDateString(),
                'fin'   => $finMois->toDateString(),
            ],
            'kpis' => [
                'interventions' => [
                    'total'        => $interventionsTotal,
                    'mois_courant' => $interventionsMois,
                    'mois_precedent' => $interventionsMoisPrec,
                    'variation'    => $this->calculVariation($interventionsMois, $interventionsMoisPrec),
                ],
                'revenus' => [
                    'mois_courant' => (float) $revenusMois,
                    'mois_precedent' => (float) $revenusMoisPrec,
                    'variation'    => $this->calculVariation($revenusMois, $revenusMoisPrec),
                ],
                'achats' => [
                    'mois_courant' => (float) $achatsMois,
                    'mois_precedent' => (float) $achatsMoisPrec,
                    'variation'    => $this->calculVariation($achatsMois, $achatsMoisPrec),
                ],
                'ventes' => [
                    'mois_courant' => (float) $ventesMois,
                    'mois_precedent' => (float) $ventesMoisPrec,
                    'variation'    => $this->calculVariation($ventesMois, $ventesMoisPrec),
                ],
                'clients' => [
                    'total'        => $clientsTotal,
                    'mois_courant' => $clientsMois,
                ],
                'infirmiers' => [
                    'total'    => $infirmiersTotal,
                    'disponibles' => $infirmiersDispo,
                ],
            ],
            'evolution_revenus_6mois' => $evolutionRevenus,
            'top_produits' => $topProduits,
        ];
    }

    /**
     * Rapport stock : produits en alerte, valeur du stock, par catégorie, etc.
     */
    public function stock(): array
    {
        // Produits avec stock géré
        $produits = Produit::where('gerer_stock', true)
            ->with(['categorie', 'entrepots'])
            ->get();

        $totalProduits = $produits->count();
        $alertesStock = [];
        $rupturesStock = [];

        foreach ($produits as $p) {
            $stockTotal = $p->entrepots->sum('pivot.quantite') ?? $p->stock_initial ?? 0;
            if ($stockTotal <= 0) {
                $rupturesStock[] = [
                    'id'        => $p->id,
                    'nom'       => $p->nom,
                    'code'      => $p->code_barres ?? '-',
                    'categorie' => $p->categorie?->nom ?? 'N/A',
                    'stock'     => 0,
                    'seuil'     => $p->quantite_alerte ?? 0,
                ];
            } elseif ($p->quantite_alerte && $stockTotal <= $p->quantite_alerte) {
                $alertesStock[] = [
                    'id'        => $p->id,
                    'nom'       => $p->nom,
                    'code'      => $p->code_barres ?? '-',
                    'categorie' => $p->categorie?->nom ?? 'N/A',
                    'stock'     => $stockTotal,
                    'seuil'     => $p->quantite_alerte,
                    'taux'      => $p->quantite_alerte > 0 ? round(($stockTotal / $p->quantite_alerte) * 100, 1) : 0,
                ];
            }
        }

        // Répartition par catégorie
        $parCategorie = Produit::selectRaw('categories.nom as categorie, COUNT(*) as count, COALESCE(SUM(produits.prix_achat), 0) as valeur')
            ->leftJoin('categories', 'produits.categorie_id', '=', 'categories.id')
            ->groupBy('categories.nom')
            ->get()
            ->map(fn($r) => [
                'categorie' => $r->categorie ?? 'Sans catégorie',
                'count'     => $r->count,
                'valeur'    => (float) $r->valeur,
            ])
            ->toArray();

        // Valeur totale du stock (prix d'achat × quantité)
        $valeurTotale = 0;
        foreach ($produits as $p) {
            $stockTotal = $p->entrepots->sum('pivot.quantite') ?? $p->stock_initial ?? 0;
            $valeurTotale += $stockTotal * ($p->prix_achat ?? 0);
        }

        return [
            'periode' => ['date' => now()->toDateString()],
            'synthese' => [
                'total_produits'    => $totalProduits,
                'produits_alerte'   => count($alertesStock),
                'produits_rupture'  => count($rupturesStock),
                'valeur_stock'      => round($valeurTotale, 2),
            ],
            'alertes'    => $alertesStock,
            'ruptures'   => $rupturesStock,
            'par_categorie' => $parCategorie,
        ];
    }

    /**
     * Rapport ventes.
     */
    public function ventes(?string $from = null, ?string $to = null): array
    {
        $from = $from ? Carbon::parse($from) : now()->startOfMonth();
        $to = $to ? Carbon::parse($to) : now();

        $ventes = Vente::whereBetween('created_at', [$from, $to])->get();
        $total = $ventes->sum('montant_total');
        $count = $ventes->count();
        $panierMoyen = $count > 0 ? $total / $count : 0;

        // Évolution jour par jour
        $evolution = Vente::selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(montant_total) as total')
            ->whereBetween('created_at', [$from, $to])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->map(fn($v) => ['date' => $v->date, 'count' => $v->count, 'total' => (float) $v->total])
            ->toArray();

        // Top produits vendus
        $topProduits = DB::table('vente_lignes')
            ->join('produits', 'vente_lignes.produit_id', '=', 'produits.id')
            ->selectRaw('produits.nom, SUM(vente_lignes.quantite) as qty, SUM(vente_lignes.quantite * ventes.prix_unitaire) as ca')
            ->join('ventes', 'vente_lignes.vente_id', '=', 'ventes.id')
            ->whereBetween('ventes.created_at', [$from, $to])
            ->groupBy('produits.id', 'produits.nom')
            ->orderByDesc('qty')
            ->limit(10)
            ->get()
            ->toArray();

        return [
            'periode' => ['debut' => $from->toDateString(), 'fin' => $to->toDateString()],
            'synthese' => [
                'total_ventes'    => $count,
                'ca_total'        => (float) $total,
                'panier_moyen'    => round($panierMoyen, 2),
            ],
            'evolution'      => $evolution,
            'top_produits'   => $topProduits,
        ];
    }

    /**
     * Rapport achats.
     */
    public function achats(?string $from = null, ?string $to = null): array
    {
        $from = $from ? Carbon::parse($from) : now()->startOfMonth();
        $to = $to ? Carbon::parse($to) : now();

        $achats = Achat::whereBetween('created_at', [$from, $to])->get();
        $total = $achats->sum('montant_total');
        $count = $achats->count();

        // Répartition par statut
        $parStatut = Achat::selectRaw('statut, COUNT(*) as count, SUM(montant_total) as total')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('statut')
            ->get()
            ->toArray();

        $parStatutPaiement = Achat::selectRaw('statut_paiement, COUNT(*) as count, SUM(montant_total) as total')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('statut_paiement')
            ->get()
            ->toArray();

        // Top fournisseurs
        $topFournisseurs = Achat::selectRaw('fournisseurs.nom, COUNT(*) as count, SUM(achats.montant_total) as total')
            ->join('fournisseurs', 'achats.fournisseur_id', '=', 'fournisseurs.id')
            ->whereBetween('achats.created_at', [$from, $to])
            ->groupBy('fournisseurs.id', 'fournisseurs.nom')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->toArray();

        // Évolution
        $evolution = Achat::selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(montant_total) as total')
            ->whereBetween('created_at', [$from, $to])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->toArray();

        return [
            'periode' => ['debut' => $from->toDateString(), 'fin' => $to->toDateString()],
            'synthese' => [
                'total_achats'   => $count,
                'montant_total'  => (float) $total,
                'panier_moyen'   => $count > 0 ? round($total / $count, 2) : 0,
            ],
            'par_statut'         => $parStatut,
            'par_statut_paiement'=> $parStatutPaiement,
            'top_fournisseurs'   => $topFournisseurs,
            'evolution'          => $evolution,
        ];
    }

    /**
     * Rapport interventions.
     */
    public function interventions(?string $from = null, ?string $to = null): array
    {
        $from = $from ? Carbon::parse($from) : now()->startOfMonth();
        $to = $to ? Carbon::parse($to) : now();

        $interventions = Intervention::whereBetween('created_at', [$from, $to]);

        $count = $interventions->count();

        // Par statut
        $parStatut = Intervention::selectRaw('statut, COUNT(*) as count')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('statut')
            ->get()
            ->toArray();

        // Top infirmiers
        $topInfirmiers = Intervention::selectRaw('users.nom, users.prenom, COUNT(*) as count, SUM(factures.montant_total) as ca')
            ->join('infirmiers', 'interventions.infirmier_id', '=', 'infirmiers.id')
            ->join('users', 'infirmiers.user_id', '=', 'users.id')
            ->leftJoin('factures', 'interventions.id', '=', 'factures.intervention_id')
            ->whereBetween('interventions.created_at', [$from, $to])
            ->groupBy('infirmiers.id', 'users.nom', 'users.prenom')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->toArray();

        // Évolution
        $evolution = Intervention::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$from, $to])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->toArray();

        // Temps moyen de traitement (de création à clôture)
        $tempsMoyen = Intervention::whereNotNull('notes_infirmier')
            ->where('statut', 'terminee')
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours')
            ->value('avg_hours');

        return [
            'periode' => ['debut' => $from->toDateString(), 'fin' => $to->toDateString()],
            'synthese' => [
                'total'         => $count,
                'terminees'     => Intervention::where('statut', 'terminee')->whereBetween('created_at', [$from, $to])->count(),
                'en_cours'      => Intervention::whereIn('statut', ['en_cours', 'acceptee'])->whereBetween('created_at', [$from, $to])->count(),
                'annulees'      => Intervention::where('statut', 'annulee')->whereBetween('created_at', [$from, $to])->count(),
                'temps_moyen_h' => round((float) $tempsMoyen, 1),
            ],
            'par_statut'      => $parStatut,
            'top_infirmiers'  => $topInfirmiers,
            'evolution'       => $evolution,
        ];
    }

    /**
     * Rapport finances (revenus vs dépenses).
     */
    public function finances(?string $from = null, ?string $to = null): array
    {
        $from = $from ? Carbon::parse($from) : now()->startOfMonth();
        $to = $to ? Carbon::parse($to) : now();

        $revenus = Facture::whereBetween('created_at', [$from, $to])->sum('montant_total');
        $depenses = Achat::whereBetween('created_at', [$from, $to])->sum('montant_total');

        // Transactions financières
        $depots = \App\Models\TransactionFinanciere::where('type', 'Depot')->whereBetween('created_at', [$from, $to])->sum('montant');
        $depensesTrans = \App\Models\TransactionFinanciere::where('type', 'Depense')->whereBetween('created_at', [$from, $to])->sum('montant');
        $transferts = \App\Models\TransactionFinanciere::where('type', 'Transfert')->whereBetween('created_at', [$from, $to])->sum('montant');

        $marge = $revenus - $depenses;

        return [
            'periode' => ['debut' => $from->toDateString(), 'fin' => $to->toDateString()],
            'synthese' => [
                'revenus'    => (float) $revenus,
                'depenses'   => (float) $depenses,
                'marge'      => (float) $marge,
                'taux_marge' => $revenus > 0 ? round(($marge / $revenus) * 100, 1) : 0,
            ],
            'transactions' => [
                'depots'      => (float) $depots,
                'depenses'    => (float) $depensesTrans,
                'transferts'  => (float) $transferts,
            ],
        ];
    }

    /**
     * Évolution des revenus sur N mois.
     */
    protected function evolutionRevenus(int $mois = 6): array
    {
        $data = [];
        for ($i = $mois - 1; $i >= 0; $i--) {
            $debut = now()->subMonths($i)->startOfMonth();
            $fin = now()->subMonths($i)->endOfMonth();

            $revenus = Facture::whereBetween('created_at', [$debut, $fin])->sum('montant_total');
            $interventions = Intervention::whereBetween('created_at', [$debut, $fin])->count();

            $data[] = [
                'mois'         => $debut->locale('fr')->isoFormat('MMM YYYY'),
                'revenus'      => (float) $revenus,
                'interventions'=> $interventions,
            ];
        }

        return $data;
    }

    /**
     * Calcule la variation en % entre deux valeurs.
     */
    protected function calculVariation($courant, $precedent): float
    {
        if ($precedent == 0) {
            return $courant > 0 ? 100.0 : 0.0;
        }

        return round((($courant - $precedent) / $precedent) * 100, 1);
    }

    /*
    |--------------------------------------------------------------------------
    | Intelligence Artificielle
    |--------------------------------------------------------------------------
    */

    /**
     * Synthèse IA — résumé global en langage naturel des KPIs principaux.
     * Utilise le LLM via z-ai-web-dev-sdk (appel HTTP) ou un fallback local.
     */
    public function iaSynthese(): array
    {
        $data = $this->synthese();

        // Construction du prompt
        $prompt = $this->construirePromptSynthese($data);

        try {
            $analyse = $this->appelLLM($prompt);
        } catch (\Throwable $e) {
            Log::error('[IA] Erreur synthèse: '.$e->getMessage());
            $analyse = $this->syntheseFallback($data);
        }

        return [
            'type'        => 'synthese',
            'genere_le'   => now()->toISOString(),
            'donnees'     => $data,
            'analyse'     => $analyse,
        ];
    }

    /**
     * Détection d'anomalies — identifie les valeurs inhabituelles.
     */
    public function iaAnomalies(): array
    {
        $anomalies = [];

        // 1. Stock en rupture
        $ruptures = Produit::where('gerer_stock', true)
            ->whereColumn('stock_initial', '<=', 'quantite_alerte')
            ->get();
        foreach ($ruptures as $p) {
            $anomalies[] = [
                'type'        => 'stock',
                'severite'    => 'haute',
                'titre'       => "Stock critique : {$p->nom}",
                'description' => "Le produit \"{$p->nom}\" a un stock de {$p->stock_initial} unités, en dessous du seuil d'alerte ({$p->quantite_alerte}).",
                'recommandation' => 'Commander en urgence auprès du fournisseur.',
            ];
        }

        // 2. Interventions sans infirmier depuis > 24h
        $interventionsEnAttente = Intervention::whereNull('infirmier_id')
            ->where('statut', 'en_attente_affectation')
            ->where('created_at', '<', now()->subDay())
            ->count();
        if ($interventionsEnAttente > 0) {
            $anomalies[] = [
                'type'        => 'intervention',
                'severite'    => 'moyenne',
                'titre'       => "{$interventionsEnAttente} intervention(s) sans affectation depuis > 24h",
                'description' => "Des interventions sont en attente d'affectation depuis plus de 24 heures. Risque d'insatisfaction client.",
                'recommandation' => 'Affecter manuellement un infirmier disponible.',
            ];
        }

        // 3. Baisse de revenus > 20% vs mois précédent
        $data = $this->synthese();
        if ($data['kpis']['revenus']['variation'] < -20) {
            $anomalies[] = [
                'type'        => 'financier',
                'severite'    => 'haute',
                'titre'       => "Baisse des revenus de {$data['kpis']['revenus']['variation']}%",
                'description' => "Les revenus du mois en cours sont en baisse significative par rapport au mois précédent.",
                'recommandation' => 'Analyser les causes (baisse de demandes, annulations, etc.) et lancer une campagne marketing.',
            ];
        }

        // 4. Infirmier surchargé (> 10 interventions ce mois)
        $topInfirmier = Intervention::selectRaw('infirmier_id, COUNT(*) as count')
            ->whereNotNull('infirmier_id')
            ->whereMonth('created_at', now()->month)
            ->groupBy('infirmier_id')
            ->havingRaw('count > 10')
            ->get();
        foreach ($topInfirmier as $t) {
            $inf = \App\Models\Infirmier::with('user')->find($t->infirmier_id);
            $anomalies[] = [
                'type'        => 'charge',
                'severite'    => 'moyenne',
                'titre'       => "Infirmier surchargé : {$inf?->user?->nom_complet}",
                'description' => "{$t->count} interventions assignées ce mois à {$inf?->user?->nom_complet} (seuil recommandé : 10).",
                'recommandation' => 'Rééquilibrer la charge en affectant à d\'autres infirmiers disponibles.',
            ];
        }

        return [
            'type'        => 'anomalies',
            'genere_le'   => now()->toISOString(),
            'total'        => count($anomalies),
            'par_severite' => [
                'haute'   => count(array_filter($anomalies, fn($a) => $a['severite'] === 'haute')),
                'moyenne' => count(array_filter($anomalies, fn($a) => $a['severite'] === 'moyenne')),
                'basse'   => count(array_filter($anomalies, fn($a) => $a['severite'] === 'basse')),
            ],
            'anomalies'    => $anomalies,
        ];
    }

    /**
     * Prévisions IA — projections pour les 30 prochains jours basées sur l'historique.
     */
    public function iaPrevisions(): array
    {
        // Calcul des moyennes sur 3 mois
        $debut3Mois = now()->subMonths(3)->startOfMonth();

        $revenusMoyen = Facture::where('created_at', '>=', $debut3Mois)
            ->selectRaw('AVG(montant_total) as avg, COUNT(*) as count')
            ->first();

        $interventionsMoyen = Intervention::where('created_at', '>=', $debut3Mois)
            ->selectRaw('COUNT(*) / 3 as per_month')
            ->value('per_month');

        // Tendance (croissance/décroissance)
        $revenusMois1 = Facture::whereMonth('created_at', now()->subMonths(2)->month)->sum('montant_total');
        $revenusMois2 = Facture::whereMonth('created_at', now()->subMonths(1)->month)->sum('montant_total');
        $revenusMois3 = Facture::whereMonth('created_at', now()->month)->sum('montant_total');

        $tendanceRevenus = $this->calculerTendance([$revenusMois1, $revenusMois2, $revenusMois3]);

        // Projection simple : moyenne × (1 + pente)
        $projection30Jours = $revenusMoyen->avg * (1 + ($tendanceRevenus['pente'] / 100));

        return [
            'type'        => 'previsions',
            'genere_le'   => now()->toISOString(),
            'horizon'     => '30 jours',
            'previsions'  => [
                'revenus_estime'   => round(max(0, $projection30Jours), 2),
                'interventions_estimees' => round((float) $interventionsMoyen, 0),
                'taux_occupation_infimiers' => $this->prevoirTauxOccupation(),
            ],
            'tendances'   => [
                'revenus'   => $tendanceRevenus,
                'details'   => [
                    'mois_m2' => (float) $revenusMois1,
                    'mois_m1' => (float) $revenusMois2,
                    'mois_m0' => (float) $revenusMois3,
                ],
            ],
            'confiance'   => $revenusMoyen->count >= 10 ? 'haute' : ($revenusMoyen->count >= 3 ? 'moyenne' : 'basse'),
        ];
    }

    /**
     * Recommandations IA — suggestions d'actions concrètes.
     */
    public function iaRecommandations(): array
    {
        $recommandations = [];
        $synthese = $this->synthese();
        $anomalies = $this->iaAnomalies()['anomalies'];

        // 1. Si stock en alerte → recommander commande
        $alertes = array_filter($anomalies, fn($a) => $a['type'] === 'stock');
        if (count($alertes) > 0) {
            $recommandations[] = [
                'priorite'    => 'haute',
                'categorie'    => 'logistique',
                'titre'        => 'Réapprovisionnement urgent',
                'description'  => count($alertes).' produit(s) nécessitent un réapprovisionnement immédiat.',
                'action'       => 'Passer commande auprès des fournisseurs habituels.',
                'impact_estime' => 'Éviter ruptures de stock et pertes de ventes.',
            ];
        }

        // 2. Si revenus en hausse > 10% → recommander investissement
        if ($synthese['kpis']['revenus']['variation'] > 10) {
            $recommandations[] = [
                'priorite'    => 'moyenne',
                'categorie'    => 'strategie',
                'titre'        => 'Maintenir la dynamique de croissance',
                'description'  => "Les revenus sont en hausse de {$synthese['kpis']['revenus']['variation']}% ce mois.",
                'action'       => 'Investir dans le marketing et recruter pour absorber la croissance.',
                'impact_estime' => 'Consolider la position sur le marché.',
            ];
        }

        // 3. Si infirmier surchargé → recommander équilibrage
        $charges = array_filter($anomalies, fn($a) => $a['type'] === 'charge');
        if (count($charges) > 0) {
            $recommandations[] = [
                'priorite'    => 'moyenne',
                'categorie'    => 'rh',
                'titre'        => 'Équilibrer la charge des infirmiers',
                'description'  => count($charges).' infirmier(s) ont une charge élevée.',
                'action'       => 'Réaffecter les interventions vers des infirmiers moins chargés.',
                'impact_estime' => 'Améliorer la qualité de service et prévenir l\'épuisement.',
            ];
        }

        // 4. Si nouveaux clients ce mois → recommander fidélisation
        if ($synthese['kpis']['clients']['mois_courant'] > 0) {
            $recommandations[] = [
                'priorite'    => 'moyenne',
                'categorie'    => 'marketing',
                'titre'        => 'Programme de fidélisation',
                'description'  => $synthese['kpis']['clients']['mois_courant'].' nouveau(x) client(s) ce mois.',
                'action'       => 'Envoyer un email de bienvenue et proposer une offre de fidélisation.',
                'impact_estime' => 'Augmenter le taux de rétention de 25% en moyenne.',
            ];
        }

        return [
            'type'           => 'recommandations',
            'genere_le'      => now()->toISOString(),
            'total'          => count($recommandations),
            'recommandations' => $recommandations,
        ];
    }

    /**
     * Appel au LLM via z-ai-web-dev-sdk (HTTP).
     * En cas d'échec, fallback sur synthèse locale.
     */
    protected function appelLLM(string $prompt): string
    {
        // Détecte si on est en local (pas de clé API)
        if (app()->environment('local') && ! config('services.llm.api_key')) {
            return $this->syntheseFallback(['prompt' => $prompt]);
        }

        try {
            $response = Http::timeout(30)->post('http://localhost:3000/api/llm', [
                'prompt' => $prompt,
                'max_tokens' => 800,
            ]);

            if ($response->successful()) {
                return $response->json('content') ?? $this->syntheseFallback([]);
            }
        } catch (\Throwable $e) {
            Log::warning('[IA] LLM non disponible, fallback local: '.$e->getMessage());
        }

        return $this->syntheseFallback(['prompt' => $prompt]);
    }

    /**
     * Construit le prompt pour la synthèse IA.
     */
    protected function construirePromptSynthese(array $data): string
    {
        $k = $data['kpis'] ?? [];
        return "Tu es un analyste de données pour Dar-Soins, plateforme de soins à domicile au Maroc. ".
               "Génère une synthèse en français de 200-300 mots max des KPIs suivants :\n\n".
               "- Interventions ce mois : {$k['interventions']['mois_courant']} (variation : {$k['interventions']['variation']}%)\n".
               "- Revenus ce mois : {$k['revenus']['mois_courant']} MAD (variation : {$k['revenus']['variation']}%)\n".
               "- Achats ce mois : {$k['achats']['mois_courant']} MAD\n".
               "- Ventes ce mois : {$k['ventes']['mois_courant']} MAD\n".
               "- Nouveaux clients : {$k['clients']['mois_courant']} (total : {$k['clients']['total']})\n".
               "- Infirmiers : {$k['infirmiers']['disponibles']} disponibles / {$k['infirmiers']['total']}\n\n".
               "Structure ta réponse en 3 paragraphes :\n".
               "1. Constats principaux\n".
               "2. Points d'attention\n".
               "3. Recommandations stratégiques";
    }

    /**
     * Fallback local si le LLM n'est pas disponible.
     */
    protected function syntheseFallback(array $data): string
    {
        $kpis = $data['kpis'] ?? $this->synthese()['kpis'];

        $constats = [];
        $constats[] = "Sur la période en cours, la plateforme Dar-Soins a enregistré {$kpis['interventions']['mois_courant']} interventions, ";
        $constats[] = "générant un chiffre d'affaires de ".number_format($kpis['revenus']['mois_courant'], 0, ',', ' ')." MAD. ";
        $constats[] = "La base de clients s'établit à {$kpis['clients']['total']} utilisateurs, dont {$kpis['clients']['mois_courant']} nouveaux ce mois. ";
        $constats[] = "{$kpis['infirmiers']['disponibles']} infirmiers sur {$kpis['infirmiers']['total']} sont actuellement disponibles.";

        $points = [];
        if ($kpis['revenus']['variation'] < 0) {
            $points[] = "⚠️ Baisse des revenus de {$kpis['revenus']['variation']}% par rapport au mois précédent — à surveiller.";
        } else {
            $points[] = "✅ Hausse des revenus de {$kpis['revenus']['variation']}% — dynamique positive.";
        }
        if ($kpis['interventions']['variation'] < 0) {
            $points[] = "📉 Le volume d'interventions est en baisse de ".abs($kpis['interventions']['variation'])."%.";
        }

        $recommandations = [];
        $recommandations[] = "Maintenir la qualité de service et surveiller les stocks de matériel.";
        $recommandations[] = "Anticiper les pics de demande et ajuster le planning des infirmiers.";
        if ($kpis['revenus']['variation'] < 0) {
            $recommandations[] = "Envisager une campagne marketing pour stimuler la demande.";
        }

        return implode(' ', $constats)."\n\n".
               "Points d'attention :\n- ".implode("\n- ", $points)."\n\n".
               "Recommandations :\n- ".implode("\n- ", $recommandations);
    }

    /**
     * Calcule la tendance (pente en %) d'une série de valeurs.
     */
    protected function calculerTendance(array $valeurs): array
    {
        $n = count($valeurs);
        if ($n < 2) return ['pente' => 0, 'direction' => 'stable'];

        $moyenneX = ($n - 1) / 2;
        $moyenneY = array_sum($valeurs) / $n;

        $numerateur = 0;
        $denominateur = 0;
        foreach ($valeurs as $i => $y) {
            $numerateur += ($i - $moyenneX) * ($y - $moyenneY);
            $denominateur += pow($i - $moyenneX, 2);
        }

        $pente = $denominateur > 0 ? $numerateur / $denominateur : 0;
        $pentePct = $moyenneY > 0 ? ($pente / $moyenneY) * 100 : 0;

        return [
            'pente'     => round($pentePct, 1),
            'direction' => $pentePct > 5 ? 'hausse' : ($pentePct < -5 ? 'baisse' : 'stable'),
        ];
    }

    /**
     * Prévoit le taux d'occupation des infirmiers.
     */
    protected function prevoirTauxOccupation(): float
    {
        $infirmiers = \App\Models\Infirmier::count();
        if ($infirmiers === 0) return 0;

        $interventionsEnCours = Intervention::whereIn('statut', ['en_cours', 'acceptee'])->count();
        return round(($interventionsEnCours / $infirmiers) * 100, 1);
    }
}
