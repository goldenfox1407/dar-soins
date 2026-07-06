<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Étiquettes {{ $achat->reference }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .label {
            width: 45%;
            display: inline-block;
            border: 1px dashed #ccc;
            padding: 10px;
            margin: 5px;
            text-align: center;
        }
        .barcode {
            font-family: 'Courier New', Courier, monospace;
            font-size: 18px;
            letter-spacing: 2px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    @foreach($achat->lignes as $ligne)
        @for($i = 0; $i < $ligne->quantite; $i++)
            <div class="label">
                <strong>{{ $ligne->produit->nom ?? 'Produit inconnu' }}</strong><br>
                Réf: {{ $achat->reference }}<br>
                <div class="barcode">*{{ $ligne->produit->code_barre ?? rand(1000000, 9999999) }}*</div>
            </div>
        @endfor
    @endforeach
</body>
</html>
