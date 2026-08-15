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
        Schema::create('contrats', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('infirmier_id')->nullable()->constrained('infirmiers')->nullOnDelete();
            $table->enum('type_garde', ['nuit', 'jour', '24h', 'post_operatoire', 'accompagnement_senior'])->default('nuit');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('horaires_garde')->nullable(); // ex: "20h00 - 08h00"
            $table->decimal('tarif_journalier', 10, 2)->default(0.00);
            $table->decimal('montant_total', 12, 2)->default(0.00);
            $table->enum('statut', ['actif', 'termine', 'en_attente', 'resilie'])->default('actif');
            $table->text('clauses_specifiques')->nullable();
            $table->text('prescriptions_medicales')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contrats');
    }
};
