<!DOCTYPE html>
<html>
<head>
    <title>Devis Dar Soins</title>
    <style>
        body { font-family: 'Helvetica', Arial, sans-serif; color: #333; line-height: 1.5; font-size: 14px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #2563EB; margin-bottom: 5px; }
        .info-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .info-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .details-table th { background-color: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        .details-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .total-row { font-weight: bold; font-size: 16px; background-color: #f8fafc; }
        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 50px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DAR SOINS</h1>
        <p>Devis d'Intervention à Domicile</p>
    </div>

    <table class="info-table">
        <tr>
            <td width="30%"><strong>Date de demande :</strong></td>
            <td>{{ \Carbon\Carbon::parse($intervention->created_at)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Client :</strong></td>
            <td>{{ $intervention->client->user->name }}</td>
        </tr>
        <tr>
            <td><strong>Date d'intervention prévue :</strong></td>
            <td>{{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y à H:i') }}</td>
        </tr>
    </table>

    <table class="details-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Montant (MAD)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $intervention->produit->nom }} (Soin/Garde)</td>
                <td style="text-align: right;">{{ number_format($intervention->produit->prix_client, 2) }}</td>
            </tr>
            <tr>
                <td>Frais de déplacement (Basé sur la distance estimée)</td>
                <td style="text-align: right;">{{ number_format($devis->frais_deplacement, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL ESTIMÉ (TTC)</td>
                <td style="text-align: right; color: #10B981;">{{ number_format($devis->montant_estime, 2) }} MAD</td>
            </tr>
        </tbody>
    </table>

    <p style="font-size: 12px; color: #64748b;">* Ce devis est une estimation. Des frais de matériels ou de consommables peuvent s'ajouter selon les besoins de l'intervention.</p>

    <div style="text-align: right; margin-top: 40px; margin-bottom: 60px;">
        <p><strong>La Direction Générale</strong></p>
        <img src="{{ public_path('cachet_signature.png') }}" style="width: 200px; height: auto;" alt="Cachet et Signature">
    </div>

    <div class="footer">
        <p>Dar Soins - Contact : contact@dar-soins.ma | +212 5 00 00 00 00</p>
    </div>
</body>
</html>
