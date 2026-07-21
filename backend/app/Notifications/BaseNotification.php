<?php

namespace App\Notifications;

use App\Models\NotifConfig;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

/**
 * Classe de base abstraite pour toutes les notifications Dar-Soins.
 *
 * Toutes les notifications concrètes étendent cette classe et implémentent :
 *   - toBroadcast() : données à envoyer sur le canal WebSocket temps réel
 *   - toDatabase() : données à stocker en base pour l'historique
 *   - toMail() : contenu de l'email (si canal email activé)
 *   - getNotifiables() : utilisateurs à notifier (renseigné via ServiceNotification)
 *
 * Le canal 'broadcast' envoie en temps réel via Reverb/Pusher.
 * Le canal 'database' stocke une ligne dans la table `notifications`.
 * Le canal 'mail' envoie un email via MAIL_MAILER.
 */
abstract class BaseNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected NotifConfig $config;
    protected array $canals = ['database'];
    protected array $options;

    public function __construct(
        public $payload = null,
        public ?string $evenement = null,
        ?NotifConfig $config = null,
        array $options = []
    ) {
        $this->config = $config ?? NotifConfig::pourEvenement($evenement ?? '') ?? new NotifConfig();
        $this->options = $options;
    }

    /**
     * Surcharge les canaux à utiliser (appelé par ServiceNotification).
     */
    public function setCanals(array $canals): void
    {
        $this->canals = $canals;
    }

    /**
     * Canaux de diffusion (override standard Laravel).
     */
    public function via(object $notifiable): array
    {
        return $this->canals;
    }

    /*
    |--------------------------------------------------------------------------
    | Données partagées
    |--------------------------------------------------------------------------
    */

    /**
     * Icône Lucide à afficher côté front (sera stockée dans notifications.icone).
     */
    public function getIcone(): string
    {
        return $this->config->icone ?? 'bell';
    }

    /**
     * Couleur CSS du badge (par défaut bleu primaire).
     */
    public function getCouleur(): string
    {
        return '#2563EB';
    }

    /**
     * URL cliquable côté front (lien vers la ressource concernée).
     */
    public function getUrlCible(): ?string
    {
        return $this->options['url_cible'] ?? null;
    }

    /**
     * Titre court de la notification (ex: "Nouvelle intervention #42").
     */
    abstract public function getTitre(): string;

    /**
     * Message principal (corps de la notification).
     */
    abstract public function getMessage(): string;

    /*
    |--------------------------------------------------------------------------
    | Channels
    |--------------------------------------------------------------------------
    */

    /**
     * Canal de stockage en base.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'evenement'  => $this->evenement,
            'titre'      => $this->getTitre(),
            'message'    => $this->getMessage(),
            'icone'      => $this->getIcone(),
            'couleur'    => $this->getCouleur(),
            'url_cible'  => $this->getUrlCible(),
            'payload_id' => $this->payload?->id ?? null,
            'payload_type' => $this->payload ? get_class($this->payload) : null,
            'extra'      => $this->options['extra'] ?? [],
        ];
    }

    /**
     * Données temps réel envoyées sur WebSocket.
     */
    public function toBroadcast(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }

    /**
     * Type du broadcast — utilisé par Reverb/Pusher côté front pour filtrer.
     */
    public function broadcastType(): string
    {
        return static::class;
    }

    /**
     * Email — implémentation par défaut simple, peut être surchargé.
     */
    public function toMail(object $notifiable)
    {
        $appName = config('app.name', 'Dar-Soins');

        return (new \Illuminate\Notifications\Messages\MailMessage())
            ->subject('['.$appName.'] '.$this->getTitre())
            ->greeting('Bonjour '.($notifiable->prenom ?? $notifiable->nom).',')
            ->line($this->getMessage())
            ->action('Voir sur la plateforme', $this->getUrlCible() ?? config('app.url'))
            ->line('Cordialement,')
            ->salutation("L'équipe {$appName}");
    }
}
