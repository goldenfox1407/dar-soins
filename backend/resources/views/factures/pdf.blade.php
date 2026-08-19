<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture {{ $facture->reference }}</title>
<style>
  @page {
    margin: 15px 25px;
  }
  
  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
  }

  body {
    font-family: Helvetica, Arial, sans-serif;
    color: #1E293B;
    font-size: 10.5px;
    line-height: 1.4;
    background: #fff;
  }

  .top-bar {
    background: #2563EB;
    height: 5px;
    width: 100%;
    margin-bottom: 12px;
  }

  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }
  .header-table td {
    vertical-align: middle;
  }

  .invoice-meta-table {
    width: 260px;
    margin-left: auto;
    border-collapse: collapse;
    font-size: 10.5px;
  }
  .invoice-meta-table td {
    padding: 2px 0;
  }
  .invoice-meta-table td.lbl {
    color: #64748B;
    font-weight: bold;
    width: 45%;
  }
  .invoice-meta-table td.val {
    text-align: right;
    font-weight: bold;
    color: #1E293B;
  }

  /* ── Parties ── */
  .parties-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
  }
  .parties-table td {
    width: 50%;
    vertical-align: top;
  }

  .party-box {
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .party-title {
    background: #2563EB;
    color: white;
    padding: 5px 10px;
    font-weight: bold;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .party-details {
    padding: 8px 10px;
    line-height: 1.5;
    background: #F8FAFC;
    color: #334155;
  }

  /* ── Tableau des prestations ── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
  }
  
  .items-table thead tr {
    background: #2563EB;
    color: white;
  }
  
  .items-table th {
    padding: 7px 10px;
    font-size: 9.5px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
  }
  
  .items-table th.r { text-align: right; }
  .items-table th.c { text-align: center; }

  .items-table tbody tr {
    border-bottom: 1px solid #E2E8F0;
  }
  .items-table tbody tr:nth-child(even) {
    background: #F8FAFC;
  }
  
  .items-table td {
    padding: 7px 10px;
    vertical-align: middle;
  }
  
  .items-table td.r { text-align: right; }
  .items-table td.c { text-align: center; }

  .item-name {
    font-weight: bold;
    color: #1E293B;
    font-size: 10.5px;
  }
  
  .item-sub {
    font-size: 9px;
    color: #64748B;
    margin-top: 1px;
  }

  .badge-tag {
    display: inline-block;
    font-size: 8px;
    font-weight: bold;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  
  .badge-soin { background: #DBEAFE; color: #1E40AF; }
  .badge-conso { background: #E0E7FF; color: #3730A3; }
  .badge-deplacement { background: #FEF3C7; color: #92400E; }

  /* ── Totaux ── */
  .totals-wrapper {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }
  
  .totals-wrapper td.payment-col {
    width: 50%;
    vertical-align: top;
    padding-right: 15px;
  }
  
  .totals-wrapper td.totals-col {
    width: 50%;
    vertical-align: top;
  }

  .payment-info-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 10px;
    color: #334155;
    line-height: 1.4;
  }

  .totals-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .totals-table tr {
    border-bottom: 1px solid #E2E8F0;
  }
  
  .totals-table td {
    padding: 6px 12px;
    font-size: 10.5px;
  }
  
  .totals-table td.lbl {
    color: #475569;
    font-weight: bold;
  }
  
  .totals-table td.val {
    text-align: right;
    color: #1E293B;
    font-weight: bold;
  }
  
  .totals-table tr.grand-total {
    background: #2563EB;
    color: white;
  }
  .totals-table tr.grand-total td.lbl,
  .totals-table tr.grand-total td.val {
    color: white;
    font-size: 11.5px;
    padding: 7px 12px;
  }

  .signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  .signatures-table td {
    width: 50%;
    vertical-align: top;
  }

  .sig-box {
    border: 1px dashed #CBD5E1;
    border-radius: 6px;
    padding: 6px;
    min-height: 60px;
    background: #FAFAFA;
  }

  .sig-label {
    font-size: 8px;
    font-weight: bold;
    text-transform: uppercase;
    color: #64748B;
    margin-bottom: 4px;
  }

  .legal {
    padding-top: 8px;
    border-top: 1px solid #E2E8F0;
    font-size: 9px;
    color: #64748B;
    line-height: 1.45;
    text-align: center;
  }
  .legal strong {
    color: #475569;
  }

  .thank-you {
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    color: #2563EB;
    margin-bottom: 8px;
  }

  .bottom-bar {
    background: #10B981;
    height: 3px;
    width: 100%;
    margin-top: 10px;
  }
</style>
</head>
<body>

@php
  $tva = (float)($config->tva ?? 20);
  $devise = $config->devise_defaut ?? 'MAD';
  $tvaMultiplier = 1 + ($tva / 100);

  // Soin principal
  $prixSoinTTC = (float)($intervention->produit->prix_client ?? 0);
  if ($intervention->produit && $intervention->produit->type_remise === 'percent' && $intervention->produit->valeur_remise > 0) {
      $prixSoinTTC -= $prixSoinTTC * ($intervention->produit->valeur_remise / 100);
  } elseif ($intervention->produit && $intervention->produit->type_remise === 'fixed' && $intervention->produit->valeur_remise > 0) {
      $prixSoinTTC -= (float)$intervention->produit->valeur_remise;
  }
  $prixSoinTTC = max(0, $prixSoinTTC);
  $quantiteSoin = ($intervention->type === 'garde_malade' && $intervention->duree_heures > 0) ? (float)$intervention->duree_heures : 1;
  $totalSoinTTC = $prixSoinTTC * $quantiteSoin;
  $totalSoinHT = round($totalSoinTTC / $tvaMultiplier, 2);

  // Consommables
  $totalConsoTTC = 0;
  foreach($intervention->consommations as $c) {
      if ($c->produit) {
          $totalConsoTTC += ((float)$c->quantite * (float)$c->produit->prix_client);
      }
  }

  $totalFactureTTC = (float)$facture->montant_total;
  $fraisDeplacementTTC = max(0, round($totalFactureTTC - $totalSoinTTC - $totalConsoTTC, 2));

  $totalHT = round($totalFactureTTC / $tvaMultiplier, 2);
  $totalTVA = round($totalFactureTTC - $totalHT, 2);

  // Assets optimisés
  $logoFile = file_exists(public_path('images/logo_opt.png')) ? public_path('images/logo_opt.png') : public_path('images/logo.png');
  $logoB64 = file_exists($logoFile) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoFile)) : '';

  $cachetFile = file_exists(public_path('images/cachet_opt.jpg')) ? public_path('images/cachet_opt.jpg') : public_path('images/cachet.jpg');
  $cachetB64 = file_exists($cachetFile) ? 'data:image/jpeg;base64,' . base64_encode(file_get_contents($cachetFile)) : '';
@endphp

<div class="top-bar"></div>

<div style="padding: 0 10px;">

  {{-- ══ EN-TÊTE ══ --}}
  <table class="header-table">
    <tr>
      <td style="width: 50%;">
        @if($logoB64)
          <img src="{{ $logoB64 }}" style="width: 100px; height: 100px;" alt="Dar-Soins Logo">
        @else
          <div style="font-size: 20px; font-weight: bold; color: #2563EB;">DAR-SOINS</div>
        @endif
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 20px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">Facture de soins</div>
        <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; color: #1E293B;">
          {{ $facture->reference }}
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ METADONNEES ══ --}}
  <table class="header-table" style="margin-bottom: 8px;">
    <tr>
      <td style="width: 50%; font-size: 10px; color: #475569; line-height: 1.45;">
        <strong>{{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong><br>
        {{ $config->adresse ?? '' }}{{ $config->ville ? ', ' . $config->ville : '' }}<br>
        @if($config->telephone) ☎ {{ $config->telephone }} @endif
        @if($config->email_contact) &nbsp;|&nbsp; ✉ {{ $config->email_contact }} @endif
      </td>
      <td style="width: 50%; vertical-align: bottom;">
        <table class="invoice-meta-table">
          <tr>
            <td class="lbl">Date émission :</td>
            <td class="val">{{ $facture->created_at->format('d/m/Y') }}</td>
          </tr>
          <tr>
            <td class="lbl">Intervention du :</td>
            <td class="val">{{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y à H:i') }}</td>
          </tr>
          <tr>
            <td class="lbl">Statut :</td>
            <td class="val" style="color: #16A34A;">Régularisé / Clôturé</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- ══ PARTIES COTE A COTE ══ --}}
  <table class="parties-table">
    <tr>
      <td style="padding-right: 8px;">
        <div class="party-box">
          <div class="party-title">Facturé à</div>
          <div class="party-details">
            <strong style="color: #000000; font-size: 11px;">{{ $intervention->client->user->name ?? 'Patient' }}</strong><br>
            @if(optional($intervention->client->user)->telephone)<strong>Tél :</strong> {{ $intervention->client->user->telephone }}<br>@endif
            @if(optional($intervention->client->user)->email)<strong>Email :</strong> {{ $intervention->client->user->email }}<br>@endif
            <strong>Adresse :</strong> {{ $intervention->localisation->adresse ?? 'Domicile du patient' }}
          </div>
        </div>
      </td>
      <td style="padding-left: 8px;">
        <div class="party-box">
          <div class="party-title">Intervention Réalisée</div>
          <div class="party-details">
            <strong style="color: #000000; font-size: 11px;">{{ $intervention->produit->nom ?? 'Soin infirmier' }}</strong><br>
            <strong>Type de prestation :</strong> {{ ucfirst(str_replace('_', ' ', $intervention->type)) }}<br>
            <strong>Soignant intervenant :</strong> {{ $intervention->infirmier->user->name ?? 'Soignant Dar-Soins' }}
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ PRESTATIONS & CONSOMMABLES ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%;">Désignation de la prestation / Fourniture</th>
        <th class="c" style="width: 12%;">Quantité</th>
        <th class="r" style="width: 18%;">Prix Unitaire HT</th>
        <th class="r" style="width: 20%;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{-- Prestation principale --}}
      <tr>
        <td>
          <span class="badge-tag badge-soin">Prestation</span><br>
          <span class="item-name">{{ $intervention->produit->nom ?? 'Soin Infirmier' }}</span>
        </td>
        <td class="c">{{ $quantiteSoin }}{{ $intervention->type === 'garde_malade' ? ' h' : ' act.' }}</td>
        <td class="r">{{ number_format(round($prixSoinTTC / $tvaMultiplier, 2), 2, ',', ' ') }} {{ $devise }}</td>
        <td class="r"><strong>{{ number_format($totalSoinHT, 2, ',', ' ') }} {{ $devise }}</strong></td>
      </tr>

      {{-- Consommables --}}
      @foreach($intervention->consommations as $conso)
        @if($conso->produit)
        @php
          $consoUHT = round((float)$conso->produit->prix_client / $tvaMultiplier, 2);
          $consoTotalHT = round(((float)$conso->quantite * (float)$conso->produit->prix_client) / $tvaMultiplier, 2);
        @endphp
        <tr>
          <td>
            <span class="badge-tag badge-conso">Consommable</span><br>
            <span class="item-name">{{ $conso->produit->nom }}</span>
          </td>
          <td class="c">{{ $conso->quantite }}</td>
          <td class="r">{{ number_format($consoUHT, 2, ',', ' ') }} {{ $devise }}</td>
          <td class="r"><strong>{{ number_format($consoTotalHT, 2, ',', ' ') }} {{ $devise }}</strong></td>
        </tr>
        @endif
      @endforeach

      {{-- Déplacement --}}
      @if($fraisDeplacementTTC > 0)
      @php $deplHT = round($fraisDeplacementTTC / $tvaMultiplier, 2); @endphp
      <tr>
        <td>
          <span class="badge-tag badge-deplacement">Déplacement</span><br>
          <span class="item-name">Frais de déplacement</span>
        </td>
        <td class="c">1 forf.</td>
        <td class="r">{{ number_format($deplHT, 2, ',', ' ') }} {{ $devise }}</td>
        <td class="r"><strong>{{ number_format($deplHT, 2, ',', ' ') }} {{ $devise }}</strong></td>
      </tr>
      @endif
    </tbody>
  </table>

  {{-- ══ TOTAUX ══ --}}
  <table class="totals-wrapper">
    <tr>
      <td class="payment-col">
        <div class="payment-info-box">
          <strong style="text-transform: uppercase; font-size: 9.5px; display: block; margin-bottom: 4px;">Règlement</strong>
          Mode de règlement : {{ ucfirst($intervention->methode_paiement ?: 'Espèces / En ligne') }}<br>
          Montant réglé : <strong>{{ number_format($totalFactureTTC, 2, ',', ' ') }} {{ $devise }}</strong>
        </div>
      </td>
      <td class="totals-col">
        <table class="totals-table">
          <tr>
            <td class="lbl">Total HT</td>
            <td class="val">{{ number_format($totalHT, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr>
            <td class="lbl">TVA ({{ $tva }}%)</td>
            <td class="val">{{ number_format($totalTVA, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr class="grand-total">
            <td class="lbl">TOTAL TTC</td>
            <td class="val">{{ number_format($totalFactureTTC, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div class="thank-you">Merci d'avoir choisi Dar-Soins !</div>

  {{-- ══ SIGNATURES & CACHET ══ --}}
  <table class="signatures-table">
    <tr>
      <td style="padding-right: 8px;">
        <div class="sig-box">
          <div class="sig-label">Signature du Patient</div>
          @if($intervention->signature_patient)
            <img src="{{ $intervention->signature_patient }}" style="max-height: 45px; max-width: 130px;" alt="Signature Patient">
          @else
            <div style="font-size: 9px; color: #94A3B8; padding-top: 10px;">Signé lors de la visite</div>
          @endif
        </div>
      </td>
      <td style="padding-left: 8px; text-align: center;">
        @if($cachetB64)
        <div class="sig-box" style="background: #FFFFFF; text-align: center;">
          <div class="sig-label">Cachet &amp; Visa de l'entreprise</div>
          <img src="{{ $cachetB64 }}" style="max-height: 45px; max-width: 120px;" alt="Cachet Dar-Soins">
        </div>
        @endif
      </td>
    </tr>
  </table>

  {{-- ══ MENTIONS LEGALES ══ --}}
  <div class="legal">
    {{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}
    @if($config->rc) — RC {{ $config->rc }} @endif
    @if($config->if_fiscal) — IF {{ $config->if_fiscal }} @endif
    @if($config->ice) — ICE {{ $config->ice }} @endif
    @if($config->patente) — Patente {{ $config->patente }} @endif<br>
    @if($config->adresse) {{ $config->adresse }}, @endif
    {{ $config->ville ?? '' }} {{ $config->code_postal ?? '' }}
  </div>

</div>

<div class="bottom-bar"></div>

</body>
</html>
