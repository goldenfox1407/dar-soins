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
        Schema::table('infirmiers', function (Blueprint $table) {
            $table->string('cin')->nullable();
            $table->string('photo_cin_recto')->nullable();
            $table->string('photo_cin_verso')->nullable();
            $table->string('photo_diplome')->nullable();
            $table->string('telephone')->nullable();
            $table->string('type_contrat')->default('salarie'); // salarie, par_acte, les_deux
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('infirmiers', function (Blueprint $table) {
            $table->dropColumn(['cin', 'photo_cin_recto', 'photo_cin_verso', 'photo_diplome', 'telephone', 'type_contrat']);
        });
    }
};
