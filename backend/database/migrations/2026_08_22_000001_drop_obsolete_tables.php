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
        Schema::dropIfExists('materiel_produit');
        Schema::dropIfExists('signatures');
        Schema::dropIfExists('gestionnaires');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('gestionnaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            $table->foreignId('localisation_id')->nullable()->constrained('localisations')->onDelete('set null');
            $table->text('imageBase64');
            $table->timestamp('date');
            $table->timestamps();
        });

        Schema::create('materiel_produit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->foreignId('materiel_id')->constrained('materiels')->onDelete('cascade');
            $table->integer('quantite_requise')->default(1);
            $table->timestamps();
        });
    }
};
