<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retour_achats', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('achat_id')->nullable()->constrained('achats')->nullOnDelete();
            $table->foreignId('fournisseur_id')->constrained('fournisseurs');
            $table->foreignId('entrepot_id')->constrained('entrepots');
            $table->string('statut'); // Termine, En attente
            $table->decimal('montant_total', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('retour_achat_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retour_achat_id')->constrained('retour_achats')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits');
            $table->integer('quantite');
            $table->decimal('cout_unitaire', 10, 2);
            $table->decimal('sous_total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retour_achat_lignes');
        Schema::dropIfExists('retour_achats');
    }
};
