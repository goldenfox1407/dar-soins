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
        Schema::create('interventions', function (Blueprint $table) {
                        $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('infirmier_id')->nullable()->constrained('infirmiers')->nullOnDelete();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->foreignId('localisation_id')->nullable()->constrained('localisations')->nullOnDelete();
            $table->dateTime('date_heure');
            $table->string('statut')->default('en_attente'); // en_attente, en_cours, terminee, annulee
            $table->string('type'); // ponctuel, garde_malade
            $table->float('duree_heures')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interventions');
    }
};
