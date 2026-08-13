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
        Schema::create('ajustements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('entrepot_id')->nullable()->constrained('entrepots')->nullOnDelete();
            $table->date('date');
            $table->integer('total_produits')->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ajustement_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ajustement_id')->constrained('ajustements')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->enum('type', ['add', 'sub'])->default('add'); // add = addition (+), sub = soustraction (-)
            $table->integer('quantite')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ajustement_lignes');
        Schema::dropIfExists('ajustements');
    }
};
