<?php

namespace App\Mail;

use App\Models\Intervention;
use App\Models\Devis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DevisInterventionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $intervention;
    public $devis;
    public $pdfContent;

    public function __construct(Intervention $intervention, Devis $devis, $pdfContent)
    {
        $this->intervention = $intervention;
        $this->devis = $devis;
        $this->pdfContent = $pdfContent;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre devis pour l\'intervention à domicile - Dar Soins',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.devis',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfContent, 'Devis_DarSoins.pdf')
                    ->withMime('application/pdf'),
        ];
    }
}
