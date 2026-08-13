<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GenericSystemNotification extends Notification
{
    use Queueable;

    protected string $titre;
    protected string $message;
    protected string $evenement;
    protected string $icone;
    protected ?string $url;

    public function __construct(string $titre, string $message, string $evenement = 'general', string $icone = '🔔', ?string $url = null)
    {
        $this->titre = $titre;
        $this->message = $message;
        $this->evenement = $evenement;
        $this->icone = $icone;
        $this->url = $url;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'titre' => $this->titre,
            'message' => $this->message,
            'evenement' => $this->evenement,
            'icone' => $this->icone,
            'url' => $this->url,
        ];
    }
}
