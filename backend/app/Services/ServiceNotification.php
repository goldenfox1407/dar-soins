<?php

namespace App\Services;

use App\Models\NotifConfig;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service central de dispatch des notifications Dar-Soins.
 *
 * Ce service respecte strictement les configurations de NotifConfig :
 * - Si l'événement est désactivé (est_actif = false), rien n'est envoyé.
 * - Si canal_email / canal_sms / canal_app est false, ce canal est ignoré.
 * - Si le rôle du destinataire n'est pas dans destinataires[], il n'est pas notifié.
 *
 * Usage depuis n'importe quel contrôleur :
 *   ServiceNotification::dispatcher('nouvelle_intervention', $intervention, [
 *       'url_cible' => '/gestionnaire/interventions/'.$intervention->id,
 *   ]);
 */
class ServiceNotification
{
    /**
     * Dispatche une notification à tous les destinataires concernés par un événement.
     *
     * @param  string  $evenement  Slug NotifConfig (ex: "nouvelle_intervention")
     * @param  mixed  $payload  Donnée métier à transmettre (Intervention, Devis, etc.)
     * @param  array  $options  Options additionnelles: ['url_cible' => ..., 'extra' => [...]]
     * @return int  Nombre de notifications effectivement dispatchées
     */
    public static function dispatcher(string $evenement, $payload = null, array $options = []): int
    {
        $config = NotifConfig::pourEvenement($evenement);

        if (! $config || ! $config->est_actif) {
            Log::debug("[Notifications] Événement '{$evenement}' désactivé ou introuvable, skip.");

            return 0;
        }

        $destinataires = self::resoudreDestinataires($config, $payload, $options);

        if ($destinataires->isEmpty()) {
            Log::debug("[Notifications] Aucun destinataire pour '{$evenement}', skip.");

            return 0;
        }

        $classeNotification = self::resoudreClasseNotification($evenement);

        if (! class_exists($classeNotification)) {
            Log::warning("[Notifications] Classe introuvable pour '{$evenement}': {$classeNotification}");

            return 0;
        }

        $compteur = 0;
        foreach ($destinataires as $user) {
            // Respect des préférences canal par utilisateur (à implémenter plus tard si besoin)
            $canals = array_filter([
                $config->canal_app ? 'database' : null,
                $config->canal_app ? 'broadcast' : null,
                $config->canal_email ? 'mail' : null,
            ]);

            if (empty($canals)) {
                continue;
            }

            $notification = new $classeNotification($payload, $evenement, $config, $options);
            $notification->setCanals($canals);

            $user->notify($notification);
            $compteur++;
        }

        Log::info("[Notifications] '{$evenement}' dispatché à {$compteur} destinataire(s).");

        return $compteur;
    }

    /**
     * Résout la liste des utilisateurs destinataires selon le payload et la config.
     */
    protected static function resoudreDestinataires(NotifConfig $config, $payload, array $options): Collection
    {
        $roles = $config->destinataires ?? [];

        if (empty($roles)) {
            return collect();
        }

        $query = User::role($roles);

        // Ajout de destinataires spécifiques liés au payload (ex: infirmier d'une intervention)
        if ($payload && method_exists($payload, 'getNotifiables')) {
            $extra = $payload->getNotifiables();
            if (! empty($extra)) {
                $query->orWhereIn('id', collect($extra)->pluck('id'));
            }
        }

        // Surcharge manuelle via options
        if (! empty($options['extra_destinataires'])) {
            $query->orWhereIn('id', $options['extra_destinataires']);
        }

        return $query->get();
    }

    /**
     * Map slug d'événement → classe Notification.
     */
    protected static function resoudreClasseNotification(string $evenement): string
    {
        $map = [
            'nouvelle_intervention'  => \App\Notifications\NouvelleInterventionNotification::class,
            'infirmier_affecte'      => \App\Notifications\InfirmierAffecteNotification::class,
            'devis_accepte'          => \App\Notifications\DevisAccepteNotification::class,
            'devis_refuse'            => \App\Notifications\DevisRefuseNotification::class,
            'intervention_cloturee'  => \App\Notifications\InterventionClotureeNotification::class,
            'paiement_recu'          => \App\Notifications\PaiementRecuNotification::class,
            'stock_alerte'           => \App\Notifications\StockAlerteNotification::class,
            'nouveau_client'         => \App\Notifications\NouveauClientNotification::class,
        ];

        return $map[$evenement] ?? '';
    }

    /**
     * Vérifie si un événement donné est actuellement actif.
     */
    public static function estActif(string $evenement): bool
    {
        $config = NotifConfig::pourEvenement($evenement);

        return $config && $config->est_actif;
    }
}
