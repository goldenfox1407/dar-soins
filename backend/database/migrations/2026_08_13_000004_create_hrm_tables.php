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
        // Drop existing dummy tables if created in early migrations
        Schema::dropIfExists('fiches_paie');
        Schema::dropIfExists('conges');
        Schema::dropIfExists('presences');
        Schema::dropIfExists('employes');

        // 1. Employes Table
        Schema::create('employes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('matricule')->unique();
            $table->enum('type_employe', ['gestionnaire', 'infirmier_soins', 'infirmier_garde'])->default('gestionnaire');
            $table->enum('mode_remuneration', ['salarie', 'par_acte'])->default('salarie');
            $table->decimal('salaire_base', 12, 2)->default(0.00);
            $table->decimal('tarif_acte', 10, 2)->default(0.00); // Pour les infirmiers des soins par acte
            $table->string('cin')->nullable();
            $table->string('telephone')->nullable();
            $table->date('date_embauche')->nullable();
            $table->enum('statut', ['actif', 'inactif', 'en_conge'])->default('actif');
            $table->timestamps();
        });

        // 2. Presences Table
        Schema::create('presences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->date('date');
            $table->time('heure_arrivee')->nullable();
            $table->time('heure_depart')->nullable();
            $table->enum('statut', ['present', 'absent', 'retard', 'demi_journee'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Conges Table
        Schema::create('conges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->enum('type_conge', ['paye', 'maladie', 'sans_solde', 'maternite'])->default('paye');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('nombre_jours')->default(1);
            $table->enum('statut', ['en_attente', 'approuve', 'refuse'])->default('en_attente');
            $table->text('motif')->nullable();
            $table->timestamps();
        });

        // 4. Fiches de Paie Table
        Schema::create('fiches_paie', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->string('reference')->unique();
            $table->string('mois_annee'); // Format YYYY-MM (ex: 2026-08)
            $table->decimal('salaire_base', 12, 2)->default(0.00);
            $table->decimal('commissions_actes', 12, 2)->default(0.00);
            $table->decimal('primes', 12, 2)->default(0.00);
            $table->decimal('deductions', 12, 2)->default(0.00);
            $table->decimal('salaire_net', 12, 2)->default(0.00);
            $table->enum('statut_paiement', ['paye', 'en_attente'])->default('en_attente');
            $table->date('date_paiement')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fiches_paie');
        Schema::dropIfExists('conges');
        Schema::dropIfExists('presences');
        Schema::dropIfExists('employes');
    }
};
