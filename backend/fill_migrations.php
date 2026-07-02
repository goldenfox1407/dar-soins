<?php

$dir = __DIR__ . '/database/migrations';
$files = glob($dir . '/*.php');

$schemas = [
    'create_users_table' => <<<PHP
            \$table->id();
            \$table->string('nom');
            \$table->string('email')->unique();
            \$table->timestamp('email_verified_at')->nullable();
            \$table->string('password');
            \$table->string('role')->default('client'); // client, infirmier, gestionnaire
            \$table->rememberToken();
            \$table->timestamps();
PHP,
    'create_clients_table' => <<<PHP
            \$table->id();
            \$table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            \$table->string('adresse')->nullable();
            \$table->timestamps();
PHP,
    'create_gestionnaires_table' => <<<PHP
            \$table->id();
            \$table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            \$table->timestamps();
PHP,
    'create_infirmiers_table' => <<<PHP
            \$table->id();
            \$table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            \$table->string('specialite')->nullable();
            \$table->boolean('est_disponible')->default(true);
            \$table->timestamps();
PHP,
    'create_localisations_table' => <<<PHP
            \$table->id();
            \$table->float('latitude', 10, 6);
            \$table->float('longitude', 10, 6);
            \$table->timestamps();
PHP,
    'create_soins_table' => <<<PHP
            \$table->id();
            \$table->string('libelle');
            \$table->float('prix_base');
            \$table->timestamps();
PHP,
    'create_materiels_table' => <<<PHP
            \$table->id();
            \$table->string('nom');
            \$table->integer('stock_actuel')->default(0);
            \$table->float('prix_unitaire');
            \$table->timestamps();
PHP,
    'create_interventions_table' => <<<PHP
            \$table->id();
            \$table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            \$table->foreignId('infirmier_id')->nullable()->constrained('infirmiers')->nullOnDelete();
            \$table->foreignId('soin_id')->constrained('soins')->onDelete('cascade');
            \$table->foreignId('localisation_id')->nullable()->constrained('localisations')->nullOnDelete();
            \$table->dateTime('date_heure');
            \$table->string('statut')->default('en_attente'); // en_attente, en_cours, terminee, annulee
            \$table->string('type'); // ponctuel, garde_malade
            \$table->float('duree_heures')->nullable();
            \$table->timestamps();
PHP,
    'create_consommations_table' => <<<PHP
            \$table->id();
            \$table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            \$table->foreignId('materiel_id')->constrained('materiels')->onDelete('cascade');
            \$table->integer('quantite');
            \$table->timestamps();
PHP,
    'create_constante_medicales_table' => <<<PHP
            \$table->id();
            \$table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            \$table->string('tension')->nullable();
            \$table->float('glycemie')->nullable();
            \$table->dateTime('date');
            \$table->timestamps();
PHP,
    'create_devis_table' => <<<PHP
            \$table->id();
            \$table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            \$table->float('montant_estime');
            \$table->dateTime('date');
            \$table->timestamps();
PHP,
    'create_factures_table' => <<<PHP
            \$table->id();
            \$table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            \$table->string('reference')->unique();
            \$table->float('montant_total');
            \$table->string('chemin_pdf')->nullable();
            \$table->timestamps();
PHP,
    'create_configs_table' => <<<PHP
            \$table->id();
            \$table->float('tkmf_sm')->default(0); // Tarif Kilometrique
            \$table->float('tva')->default(20);
            \$table->timestamps();
PHP,
    'create_signatures_table' => <<<PHP
            \$table->id();
            \$table->foreignId('intervention_id')->constrained('interventions')->onDelete('cascade');
            \$table->foreignId('localisation_id')->nullable()->constrained('localisations')->nullOnDelete();
            \$table->longText('imageBase64');
            \$table->dateTime('date');
            \$table->timestamps();
PHP,
];

foreach ($files as $file) {
    $content = file_get_contents($file);
    foreach ($schemas as $tableName => $schema) {
        if (strpos($file, $tableName) !== false) {
            if ($tableName === 'create_users_table') {
                $content = preg_replace(
                    '/Schema::create\(\'users\', function \(Blueprint \$table\) \{(.*?)\}\);/s',
                    "Schema::create('users', function (Blueprint \$table) {\n" . $schema . "\n        });",
                    $content
                );
            } else {
                // Default replace for id and timestamps
                $content = preg_replace(
                    '/\$table->id\(\);\n.*\$table->timestamps\(\);/s',
                    $schema,
                    $content
                );
            }
            file_put_contents($file, $content);
            echo "Updated \$file\n";
        }
    }
}
