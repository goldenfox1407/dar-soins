<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. GENS
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email')->nullable();
            $table->string('telephone')->nullable();
            $table->text('adresse')->nullable();
            $table->string('entreprise')->nullable();
            $table->timestamps();
        });

        // 2. PRODUITS extensions
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('marques', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('unites', function (Blueprint $table) {
            $table->id();
            $table->string('nom'); // ex: Pièce, Kg, Litre
            $table->string('nom_court'); // ex: pc, kg, L
            $table->timestamps();
        });

        // Add columns to `produits`
        Schema::table('produits', function (Blueprint $table) {
            $table->foreignId('categorie_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('marque_id')->nullable()->constrained('marques')->nullOnDelete();
            $table->foreignId('unite_id')->nullable()->constrained('unites')->nullOnDelete();
            $table->boolean('gerer_stock')->default(true);
            $table->integer('quantite_alerte')->default(5);
        });

        // 3. WAREHOUSES
        Schema::create('entrepots', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('localisation')->nullable();
            $table->string('telephone')->nullable();
            $table->boolean('est_principal')->default(false);
            $table->timestamps();
        });

        // Produit - Entrepot (Stock actuel)
        Schema::create('produit_entrepot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('entrepot_id')->constrained('entrepots')->cascadeOnDelete();
            $table->integer('quantite')->default(0);
            $table->timestamps();
        });

        // 4. ACHATS
        Schema::create('achats', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('fournisseur_id')->constrained('fournisseurs');
            $table->foreignId('entrepot_id')->constrained('entrepots');
            $table->string('statut'); // Recu, En attente, Commande
            $table->string('statut_paiement'); // Paye, Partiel, Non paye
            $table->decimal('montant_total', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('achat_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('achat_id')->constrained('achats')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits');
            $table->integer('quantite');
            $table->decimal('cout_unitaire', 10, 2);
            $table->decimal('sous_total', 10, 2);
            $table->timestamps();
        });

        // 5. VENTES
        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('client_id')->constrained('clients');
            $table->foreignId('entrepot_id')->constrained('entrepots');
            $table->string('statut'); // Final, Brouillon, Annule
            $table->string('statut_paiement'); // Paye, Partiel, Non paye
            $table->decimal('montant_total', 10, 2);
            $table->text('note_vente')->nullable();
            $table->timestamps();
        });

        Schema::create('vente_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->constrained('ventes')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits');
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('sous_total', 10, 2);
            $table->timestamps();
        });

        // 6. HRM
        Schema::create('employes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('nom');
            $table->string('departement')->nullable();
            $table->string('designation')->nullable();
            $table->decimal('salaire_base', 10, 2)->nullable();
            $table->date('date_embauche')->nullable();
            $table->timestamps();
        });

        Schema::create('presences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->cascadeOnDelete();
            $table->date('date');
            $table->time('heure_entree')->nullable();
            $table->time('heure_sortie')->nullable();
            $table->string('statut'); // Present, Absent, Retard
            $table->timestamps();
        });

        // 7. COMPTABILITE
        Schema::create('comptes_bancaires', function (Blueprint $table) {
            $table->id();
            $table->string('nom_compte');
            $table->string('numero_compte')->nullable();
            $table->decimal('solde_initial', 12, 2)->default(0);
            $table->text('details')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions_financieres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compte_id')->constrained('comptes_bancaires');
            $table->string('type'); // Depot, Depense, Transfert
            $table->decimal('montant', 12, 2);
            $table->date('date_transaction');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions_financieres');
        Schema::dropIfExists('comptes_bancaires');
        Schema::dropIfExists('presences');
        Schema::dropIfExists('employes');
        Schema::dropIfExists('vente_lignes');
        Schema::dropIfExists('ventes');
        Schema::dropIfExists('achat_lignes');
        Schema::dropIfExists('achats');
        Schema::dropIfExists('produit_entrepot');
        Schema::dropIfExists('entrepots');
        
        Schema::table('produits', function (Blueprint $table) {
            $table->dropForeign(['categorie_id']);
            $table->dropForeign(['marque_id']);
            $table->dropForeign(['unite_id']);
            $table->dropColumn(['categorie_id', 'marque_id', 'unite_id', 'gerer_stock', 'quantite_alerte']);
        });

        Schema::dropIfExists('unites');
        Schema::dropIfExists('marques');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('fournisseurs');
    }
};
