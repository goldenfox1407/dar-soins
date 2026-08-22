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
        // 1. Enrich table 'unites' to handle both unit types
        Schema::table('unites', function (Blueprint $table) {
            if (!Schema::hasColumn('unites', 'type')) {
                $table->string('type')->default('unite')->nullable();
            }
            if (!Schema::hasColumn('unites', 'symbole')) {
                $table->string('symbole', 20)->nullable();
            }
        });

        // 2. Add JSON column to interventions for nurse refusals
        Schema::table('interventions', function (Blueprint $table) {
            if (!Schema::hasColumn('interventions', 'infirmiers_refuses_ids')) {
                $table->jsonb('infirmiers_refuses_ids')->nullable()->default('[]');
            }
        });

        // 3. Drop obsolete standalone tables
        Schema::dropIfExists('unites_bases');
        Schema::dropIfExists('intervention_refus');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('unites_bases', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('symbole')->nullable();
            $table->timestamps();
        });

        Schema::create('intervention_refus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            $table->foreignId('infirmier_id')->constrained('infirmiers')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('unites', function (Blueprint $table) {
            $table->dropColumn(['type', 'symbole']);
        });

        Schema::table('interventions', function (Blueprint $table) {
            $table->dropColumn('infirmiers_refuses_ids');
        });
    }
};
