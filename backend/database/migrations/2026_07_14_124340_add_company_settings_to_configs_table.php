<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            // Identité entreprise
            $table->string('nom_entreprise')->default('Dar Soins Médicaux SARL');
            $table->string('slogan')->nullable();
            $table->string('email_contact')->nullable();
            $table->string('telephone')->nullable();
            $table->text('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('code_postal')->nullable();
            $table->string('pays')->default('Maroc');
            $table->string('site_web')->nullable();
            $table->string('logo_path')->nullable();
            // Légal & fiscal
            $table->string('rc')->nullable();
            $table->string('ice')->nullable();
            $table->string('if_fiscal')->nullable();
            $table->string('patente')->nullable();
            $table->string('cnss')->nullable();
            // Opérationnel soins
            $table->float('rayon_intervention_km')->default(30);
            $table->integer('delai_reponse_devis_h')->default(24);
            $table->integer('delai_validite_devis_j')->default(30);
            $table->float('commission_infirmier')->default(70);
            // Facturation
            $table->string('devise_defaut')->default('MAD');
            $table->string('format_date')->default('d/m/Y');
            $table->text('mentions_facture')->nullable();
            $table->text('conditions_paiement')->nullable();
            $table->text('pied_facture')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            $table->dropColumn([
                'nom_entreprise','slogan','email_contact','telephone','adresse',
                'ville','code_postal','pays','site_web','logo_path',
                'rc','ice','if_fiscal','patente','cnss',
                'rayon_intervention_km','delai_reponse_devis_h','delai_validite_devis_j','commission_infirmier',
                'devise_defaut','format_date','mentions_facture','conditions_paiement','pied_facture',
            ]);
        });
    }
};
