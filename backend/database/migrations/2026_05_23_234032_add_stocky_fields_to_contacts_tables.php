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
        Schema::table('clients', function (Blueprint $table) {
            $table->string('code_client')->nullable()->unique();
            $table->string('telephone')->nullable();
            $table->string('pays')->nullable();
            $table->string('ville')->nullable();
            $table->string('code_postal')->nullable();
            $table->string('numero_taxe')->nullable();
            $table->decimal('limite_credit', 12, 2)->nullable();
            $table->text('notes_internes')->nullable();
        });

        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->string('code_fournisseur')->nullable()->unique();
            $table->string('pays')->nullable();
            $table->string('ville')->nullable();
            $table->string('code_postal')->nullable();
            $table->string('numero_taxe')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'code_client', 'telephone', 'pays', 'ville', 'code_postal', 
                'numero_taxe', 'limite_credit', 'notes_internes'
            ]);
        });

        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->dropColumn([
                'code_fournisseur', 'pays', 'ville', 'code_postal', 'numero_taxe'
            ]);
        });
    }
};
