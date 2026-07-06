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
        Schema::table('achats', function (Blueprint $table) {
            $table->decimal('order_tax', 10, 2)->default(0)->after('montant_total');
            $table->decimal('discount', 10, 2)->default(0)->after('order_tax');
            $table->decimal('shipping', 10, 2)->default(0)->after('discount');
        });

        Schema::table('achat_lignes', function (Blueprint $table) {
            $table->decimal('discount', 10, 2)->default(0)->after('cout_unitaire');
            $table->decimal('tax_percent', 5, 2)->default(0)->after('discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->dropColumn(['order_tax', 'discount', 'shipping']);
        });

        Schema::table('achat_lignes', function (Blueprint $table) {
            $table->dropColumn(['discount', 'tax_percent']);
        });
    }
};
