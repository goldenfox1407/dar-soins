<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add latitude and longitude to interventions table
        Schema::table('interventions', function (Blueprint $table) {
            if (!Schema::hasColumn('interventions', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable();
            }
            if (!Schema::hasColumn('interventions', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable();
            }
        });

        // 2. Copy coordinates from localisations to interventions
        if (Schema::hasTable('localisations')) {
            DB::statement("
                UPDATE interventions 
                SET latitude = localisations.latitude, 
                    longitude = localisations.longitude 
                FROM localisations 
                WHERE interventions.localisation_id = localisations.id
            ");
        }

        // 3. Migrate any materiels to produits if needed
        if (Schema::hasTable('materiels')) {
            $materiels = DB::table('materiels')->get();
            foreach ($materiels as $mat) {
                $exists = DB::table('produits')->where('nom', $mat->nom)->exists();
                if (!$exists) {
                    DB::table('produits')->insert([
                        'nom' => $mat->nom,
                        'description' => 'Consommable médical',
                        'type' => 'consommable',
                        'prix_client' => $mat->prix_unitaire ?? 5.0,
                        'prix_achat' => $mat->prix_unitaire ?? 3.0,
                        'stock_initial' => $mat->stock_actuel ?? 100,
                        'gerer_stock' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 4. Drop materiel_id from consommations
        if (Schema::hasColumn('consommations', 'materiel_id')) {
            Schema::table('consommations', function (Blueprint $table) {
                try {
                    $table->dropForeign(['materiel_id']);
                } catch (\Exception $e) {}
                $table->dropColumn('materiel_id');
            });
        }

        // 5. Drop localisation_id from interventions
        if (Schema::hasColumn('interventions', 'localisation_id')) {
            Schema::table('interventions', function (Blueprint $table) {
                try {
                    $table->dropForeign(['localisation_id']);
                } catch (\Exception $e) {}
                $table->dropColumn('localisation_id');
            });
        }

        // 6. Drop obsolete tables
        Schema::dropIfExists('materiels');
        Schema::dropIfExists('localisations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('localisations', function (Blueprint $table) {
            $table->id();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();
        });

        Schema::create('materiels', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->integer('stock_actuel')->default(0);
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('interventions', function (Blueprint $table) {
            $table->foreignId('localisation_id')->nullable()->constrained('localisations')->nullOnDelete();
            $table->dropColumn(['latitude', 'longitude']);
        });

        Schema::table('consommations', function (Blueprint $table) {
            $table->foreignId('materiel_id')->nullable()->constrained('materiels')->nullOnDelete();
        });
    }
};
