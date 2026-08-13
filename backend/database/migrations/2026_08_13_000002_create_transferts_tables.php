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
        Schema::create('transferts', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('entrepot_source_id')->nullable()->constrained('entrepots')->nullOnDelete();
            $table->foreignId('entrepot_destination_id')->nullable()->constrained('entrepots')->nullOnDelete();
            $table->date('date');
            $table->enum('statut', ['en_attente', 'complete', 'annule'])->default('complete');
            $table->integer('total_produits')->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('transfert_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfert_id')->constrained('transferts')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->integer('quantite')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfert_lignes');
        Schema::dropIfExists('transferts');
    }
};
