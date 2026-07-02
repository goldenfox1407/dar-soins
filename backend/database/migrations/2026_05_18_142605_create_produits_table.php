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
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('type', ['soin', 'garde']);
            $table->string('image')->nullable();
            $table->string('code_barres')->nullable();
            
            // Tarification
            $table->decimal('prix_client', 10, 2);
            $table->decimal('remuneration_soignant', 10, 2)->nullable(); // Null si garde (salaire fixe)
            
            // Remises
            $table->enum('type_remise', ['none', 'percent', 'fixed'])->default('none');
            $table->decimal('valeur_remise', 10, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
