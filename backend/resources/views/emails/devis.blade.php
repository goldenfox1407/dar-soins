<!DOCTYPE html>
<html>
<head>
    <title>Votre Devis Dar Soins</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Bonjour {{ $intervention->client->user->name }},</h2>
    
    <p>Suite à votre demande de soin <strong>{{ $intervention->produit->nom }}</strong> prévue pour le <strong>{{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y à H:i') }}</strong>, nous avons le plaisir de vous transmettre votre devis.</p>
    
    <p>Le montant total estimé est de : <strong>{{ $devis->montant_total }} MAD</strong>.</p>
    
    <p>Veuillez trouver les détails du devis en pièce jointe (PDF).</p>
    
    <p>Pour confirmer l'intervention et donner le feu vert à l'infirmier, merci de cliquer sur le lien ci-dessous pour accéder à votre espace patient et accepter ce devis :</p>
    
    <p style="margin: 30px 0;">
        <a href="http://localhost:5173/patient" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Accéder à mon espace pour valider
        </a>
    </p>

    <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    
    <p>Cordialement,<br>L'équipe Dar Soins</p>
</body>
</html>
