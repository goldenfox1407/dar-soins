<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notif_configs', function (Blueprint $table) {
            $table->id();
            $table->string('evenement')->unique();
            $table->string('label');
            $table->string('icone')->default('bell');
            $table->boolean('canal_email')->default(true);
            $table->boolean('canal_sms')->default(false);
            $table->boolean('canal_app')->default(true);
            $table->json('destinataires')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notif_configs');
    }
};
