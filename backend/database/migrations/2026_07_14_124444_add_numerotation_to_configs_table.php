<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            $table->string('prefix_facture')->default('FAC');
            $table->string('prefix_devis')->default('DEV');
            $table->string('prefix_achat')->default('ACH');
            $table->string('prefix_vente')->default('VTE');
            $table->string('prefix_avoir')->default('AVO');
            $table->unsignedInteger('compteur_facture')->default(1);
            $table->unsignedInteger('compteur_devis')->default(1);
            $table->unsignedInteger('compteur_achat')->default(1);
            $table->unsignedInteger('compteur_vente')->default(1);
            $table->enum('format_numero', [
                'PREFIX-YYYYMMDD-NNNN',
                'PREFIX-YYYY-NNNN',
                'PREFIX-NNNNNN',
            ])->default('PREFIX-YYYYMMDD-NNNN');
        });
    }

    public function down(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            $table->dropColumn([
                'prefix_facture','prefix_devis','prefix_achat','prefix_vente','prefix_avoir',
                'compteur_facture','compteur_devis','compteur_achat','compteur_vente','format_numero',
            ]);
        });
    }
};
