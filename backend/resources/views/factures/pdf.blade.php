<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $facture->reference }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            font-size: 14px;
            margin: 0;
            padding: 20px;
        }
        .header {
            width: 100%;
            margin-bottom: 40px;
        }
        .header td {
            vertical-align: top;
        }
        .logo-container {
            width: 50%;
        }
        .logo {
            width: 150px;
            height: auto;
        }
        .company-info {
            font-size: 13px;
            color: #555;
            margin-top: 10px;
        }
        .invoice-details {
            width: 50%;
            text-align: right;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .reference {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 15px;
        }
        .billing-info {
            width: 100%;
            margin-bottom: 40px;
        }
        .billing-info td {
            width: 50%;
            vertical-align: top;
        }
        .info-box {
            background-color: #f8fafc;
            border-left: 4px solid #0d9488;
            padding: 15px;
            border-radius: 4px;
        }
        .info-title {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 5px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .table th {
            background-color: #0f172a;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
        }
        .table th.text-right {
            text-align: right;
        }
        .table th.text-center {
            text-align: center;
        }
        .table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .table td.text-right {
            text-align: right;
        }
        .table td.text-center {
            text-align: center;
        }
        .totals-wrapper {
            width: 100%;
            margin-top: 20px;
        }
        .totals-wrapper td:first-child {
            width: 60%;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 8px 12px;
        }
        .totals-table td.label {
            text-align: right;
            font-weight: bold;
            color: #475569;
        }
        .totals-table td.value {
            text-align: right;
            width: 120px;
        }
        .total-row {
            background-color: #0d9488;
            color: white;
            font-weight: bold;
            font-size: 16px;
        }
        .total-row td.label {
            color: white;
        }
        .footer {
            margin-top: 50px;
            width: 100%;
        }
        .footer td {
            width: 50%;
            vertical-align: top;
        }
        .stamp-box {
            text-align: center;
            margin-top: 20px;
            position: relative;
        }
        .stamp {
            display: inline-block;
            border: 3px solid #dc2626;
            color: #dc2626;
            border-radius: 5px;
            padding: 10px 20px;
            font-weight: bold;
            font-size: 18px;
            text-transform: uppercase;
            transform: rotate(-5deg);
            opacity: 0.8;
            margin-bottom: 10px;
        }
        .stamp .date {
            font-size: 11px;
            margin-top: 5px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-img {
            max-height: 80px;
            max-width: 200px;
        }
        .notes {
            margin-top: 40px;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td class="logo-container">
                <table style="border: none; padding: 0; margin: 0;">
                    <tr>
                        <td style="vertical-align: middle; padding: 0; border: none;">
                            <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 45L50 15L90 45V85H10V45Z" stroke="#2563EB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="white"/>
                                <path d="M42 42H58V50H66V66H58V74H42V66H34V50H42V42Z" fill="#10B981"/>
                                <path d="M50 42V74M34 58H66" stroke="#10B981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px; border: none;">
                            <span style="font-size: 26px; font-weight: bold; color: #1E293B; letter-spacing: -1px;">Dar-Soins</span>
                        </td>
                    </tr>
                </table>
                <div class="company-info" style="margin-top: 15px;">
                    <strong>Dar Soins Médicaux</strong><br>
                    123 Avenue de la Santé<br>
                    Casablanca, 20000, Maroc<br>
                    Tél : +212 522 123 456<br>
                    Email : contact@darsoins.ma
                </div>
            </td>
            <td class="invoice-details">
                <div class="invoice-title">FACTURE</div>
                <div class="reference">Réf: {{ $facture->reference }}</div>
                <div>
                    <strong>Date d'émission :</strong> {{ $facture->created_at->format('d/m/Y') }}<br>
                    <strong>Méthode de Paiement :</strong> {{ ucfirst($intervention->methode_paiement) ?: 'Non spécifiée' }}
                </div>
            </td>
        </tr>
    </table>

    <table class="billing-info">
        <tr>
            <td style="padding-right: 15px;">
                <div class="info-box">
                    <div class="info-title">Facturé à :</div>
                    <strong>{{ $intervention->client->user->name }}</strong><br>
                    Client ID : {{ $intervention->client->id }}<br>
                    {{ $intervention->client->user->email }}
                </div>
            </td>
            <td style="padding-left: 15px;">
                <div class="info-box">
                    <div class="info-title">Intervenant (Soignant) :</div>
                    <strong>{{ $intervention->infirmier->user->name }}</strong><br>
                    ID Soignant : {{ $intervention->infirmier->id }}<br>
                    Date d'intervention : {{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th>Description du Service / Produit</th>
                <th class="text-center">Qté</th>
                <th class="text-right">Prix Unitaire</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            <!-- Prestation Principale -->
            <tr>
                <td>
                    <strong>Prestation Médicale</strong><br>
                    <span style="font-size:12px; color:#64748b;">{{ $intervention->produit->nom }}</span>
                </td>
                <td class="text-center">1</td>
                <td class="text-right">{{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} MAD</td>
                <td class="text-right">{{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} MAD</td>
            </tr>
            
            <!-- Consommables -->
            @foreach($intervention->consommations as $conso)
                @if($conso->produit)
                <tr>
                    <td>
                        Consommable<br>
                        <span style="font-size:12px; color:#64748b;">{{ $conso->produit->nom }}</span>
                    </td>
                    <td class="text-center">{{ $conso->quantite }}</td>
                    <td class="text-right">{{ number_format($conso->produit->prix_client, 2, ',', ' ') }} MAD</td>
                    <td class="text-right">{{ number_format($conso->quantite * $conso->produit->prix_client, 2, ',', ' ') }} MAD</td>
                </tr>
                @endif
            @endforeach
            
            <!-- Frais de déplacement s'il y a une différence -->
            @php
                $totalLignes = $intervention->produit->prix_client;
                foreach($intervention->consommations as $conso) {
                    if($conso->produit) {
                        $totalLignes += ($conso->quantite * $conso->produit->prix_client);
                    }
                }
                
                // Extraire le montant HT (le montant de la facture est en TTC)
                // Le tva par défaut est 20%
                $tva = 20; 
                $montantTTC = $facture->montant_total;
                $montantHT = $montantTTC / (1 + ($tva / 100));
                
                $fraisDeplacement = $montantHT - $totalLignes;
            @endphp
            
            @if($fraisDeplacement > 0.01)
            <tr>
                <td>
                    <strong>Frais de Déplacement</strong><br>
                    <span style="font-size:12px; color:#64748b;">Forfait kilométrique</span>
                </td>
                <td class="text-center">1</td>
                <td class="text-right">{{ number_format($fraisDeplacement, 2, ',', ' ') }} MAD</td>
                <td class="text-right">{{ number_format($fraisDeplacement, 2, ',', ' ') }} MAD</td>
            </tr>
            @endif
        </tbody>
    </table>

    <table class="totals-wrapper">
        <tr>
            <td>
                <!-- Espace gauche -->
            </td>
            <td>
                <table class="totals-table">
                    <tr>
                        <td class="label">Total HT</td>
                        <td class="value">{{ number_format($montantHT, 2, ',', ' ') }} MAD</td>
                    </tr>
                    <tr>
                        <td class="label">TVA ({{ $tva }}%)</td>
                        <td class="value">{{ number_format($montantTTC - $montantHT, 2, ',', ' ') }} MAD</td>
                    </tr>
                    <tr class="total-row">
                        <td class="label">TOTAL TTC</td>
                        <td class="value">{{ number_format($montantTTC, 2, ',', ' ') }} MAD</td>
                    </tr>
                    <tr>
                        <td class="label">Montant Reçu</td>
                        <td class="value">{{ number_format((float)$intervention->montant_recu, 2, ',', ' ') }} MAD</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="footer">
        <tr>
            <td class="signature-box">
                <div style="font-weight: bold; margin-bottom: 10px;">Signature du Patient :</div>
                @if($intervention->signature_patient)
                    <img src="{{ $intervention->signature_patient }}" class="signature-img" alt="Signature">
                @else
                    <div style="color: #94a3b8; font-style: italic; margin-top: 20px;">Aucune signature</div>
                @endif
            </td>
            <td class="stamp-box">
                <div class="stamp">
                    DAR SOINS<br>
                    APPROUVÉ<br>
                    <div class="date">{{ $facture->created_at->format('d/m/Y') }}</div>
                </div>
                <div style="font-weight: bold; color: #1e293b;">Cachet de l'entreprise</div>
            </td>
        </tr>
    </table>

    <div class="notes">
        <strong>Conditions :</strong> Le paiement est exigible à la fin de l'intervention. En cas de retard de paiement, des pénalités pourront être appliquées conformément à la loi en vigueur. Merci de votre confiance !
    </div>

</body>
</html>
