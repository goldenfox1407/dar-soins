<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Achat {{ $achat->reference }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        .header { text-align: center; margin-bottom: 30px; }
        .details { margin-bottom: 20px; }
        .details th { text-align: left; width: 150px; }
        table.items { width: 100%; border-collapse: collapse; }
        table.items th, table.items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        table.items th { background-color: #f8f9fa; }
        .totals { margin-top: 20px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Détail d'Achat : {{ $achat->reference }}</h2>
    </div>

    <table class="details">
        <tr><th>Fournisseur :</th><td>{{ $achat->fournisseur->nom ?? 'N/A' }}</td></tr>
        <tr><th>Entrepôt :</th><td>{{ $achat->entrepot->nom ?? 'N/A' }}</td></tr>
        <tr><th>Date :</th><td>{{ $achat->created_at->format('d/m/Y') }}</td></tr>
        <tr><th>Statut :</th><td>{{ $achat->statut }}</td></tr>
        <tr><th>Statut Paiement :</th><td>{{ $achat->statut_paiement }}</td></tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Sous-total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($achat->lignes as $ligne)
            <tr>
                <td>{{ $ligne->produit->nom ?? 'Produit inconnu' }}</td>
                <td>{{ $ligne->quantite }}</td>
                <td>{{ number_format($ligne->cout_unitaire, 2) }} MAD</td>
                <td>{{ number_format($ligne->sous_total, 2) }} MAD</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <h3>Total : {{ number_format($achat->montant_total, 2) }} MAD</h3>
    </div>
</body>
</html>
