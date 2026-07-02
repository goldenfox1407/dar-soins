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
        Schema::create('constante_medicales', function (Blueprint $table) {
                        $table->id();
            $table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            $table->string('tension')->nullable();
            $table->float('glycemie')->nullable();
            $table->dateTime('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('constante_medicales');
    }
};
