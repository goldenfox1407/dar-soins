<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tâches d'organisation interne — gérées par la rubrique "Organisation" de l'admin.
     * Permet de tracer les tâches attribuées aux membres de l'équipe (infirmiers, gestionnaires, etc.).
     */
    public function up(): void
    {
        Schema::create('taches', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique()->comment('Ex: TACHE-2026-0042');
            $table->string('titre');
            $table->text('description')->nullable();

            // Statut Kanban : à_faire | en_cours | en_revue | terminee | annulee
            $table->string('statut')->default('a_faire')->index();
            // Priorité : basse | normale | haute | urgente
            $table->string('priorite')->default('normale')->index();
            // Catégorie de tâche : organisation | administratif | logistique | rh | autre
            $table->string('categorie')->default('organisation')->index();

            // Affectations
            $table->foreignId('assigne_a')->nullable()
                ->comment('User à qui la tâche est assignée')
                ->constrained('users')->nullOnDelete();
            $table->foreignId('cree_par')
                ->comment('User qui a créé la tâche')
                ->constrained('users')->cascadeOnDelete();

            // Échéance & suivi temporel
            $table->date('echeance')->nullable()->index();
            $table->timestamp('date_debut')->nullable();
            $table->timestamp('date_cloture')->nullable();

            // Lien optionnel vers une intervention ou un autre objet métier
            $table->foreignId('intervention_id')->nullable()
                ->constrained('interventions')->nullOnDelete();

            // Tags / métadonnées
            $table->json('tags')->nullable();
            $table->unsignedInteger('progression')->default(0)->comment('0-100');

            $table->softDeletes();
            $table->timestamps();

            $table->index(['assigne_a', 'statut']);
            $table->index(['cree_par', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taches');
    }
};
