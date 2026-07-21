<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table standard Laravel pour les notifications en base (Database channel)
        // Permet de stocker les notifications persistées + marquer comme lu + Historique
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->string('evenement')->nullable()->index()->comment('Slug NotifConfig: nouvelle_intervention, devis_accepte, etc.');
            $table->string('icone')->nullable()->comment('Icône Lucide à afficher côté front');
            $table->string('couleur')->nullable()->comment('Couleur CSS pour le badge');
            $table->string('url_cible')->nullable()->comment('Lien cliquable vers la ressource concernée');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id']);
            $table->index('read_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
