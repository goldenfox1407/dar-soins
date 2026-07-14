<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions_financieres', function (Blueprint $table) {
            $table->foreignId('achat_id')
                  ->nullable()
                  ->after('compte_id')
                  ->constrained('achats')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions_financieres', function (Blueprint $table) {
            $table->dropForeign(['achat_id']);
            $table->dropColumn('achat_id');
        });
    }
};
