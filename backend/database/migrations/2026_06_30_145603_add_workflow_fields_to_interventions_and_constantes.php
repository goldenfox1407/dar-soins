<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop Postgres check constraint if exists
        try {
            DB::statement("ALTER TABLE produits DROP CONSTRAINT produits_type_check");
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist or not postgres
        }

        Schema::table('interventions', function (Blueprint $table) {
            $table->text('notes_infirmier')->nullable();
            $table->string('photo_validation_arrivee')->nullable();
            $table->string('methode_paiement')->nullable(); // espece, carte, virement
            $table->decimal('montant_recu', 10, 2)->nullable();
            $table->longText('signature_patient')->nullable();
        });

        Schema::table('constante_medicales', function (Blueprint $table) {
            $table->decimal('temperature', 5, 2)->nullable();
            $table->decimal('poids', 5, 2)->nullable();
        });

        Schema::table('consommations', function (Blueprint $table) {
            $table->foreignId('produit_id')->nullable()->constrained('produits')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interventions', function (Blueprint $table) {
            $table->dropColumn(['notes_infirmier', 'photo_validation_arrivee', 'methode_paiement', 'montant_recu', 'signature_patient']);
        });

        Schema::table('constante_medicales', function (Blueprint $table) {
            $table->dropColumn(['temperature', 'poids']);
        });

        Schema::table('consommations', function (Blueprint $table) {
            $table->dropForeign(['produit_id']);
            $table->dropColumn('produit_id');
        });
    }
};
