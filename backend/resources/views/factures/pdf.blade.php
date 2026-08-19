<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture {{ $facture->reference }}</title>
<style>
  @page {
    margin-top: 0px;
    margin-bottom: 0px;
    margin-left: 28px;
    margin-right: 28px;
    size: A4 portrait;
  }
  
  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
  }

  body {
    font-family: Helvetica, Arial, sans-serif;
    color: #1E293B;
    font-size: 11.5px;
    line-height: 1.55;
    background: #fff;
    padding-top: 22px;
    padding-bottom: 18px;
  }

  .top-bar {
    position: fixed;
    top: 0px;
    left: -28px;
    right: -28px;
    height: 7px;
    background: #2563EB;
  }

  .bottom-bar {
    position: fixed;
    bottom: 0px;
    left: -28px;
    right: -28px;
    height: 6px;
    background: #10B981;
  }

  .content-container {
    padding: 0 4px;
  }

  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
  }
  .header-table td {
    vertical-align: middle;
  }

  .invoice-meta-table {
    width: 280px;
    margin-left: auto;
    border-collapse: collapse;
    font-size: 11.5px;
  }
  .invoice-meta-table td {
    padding: 3px 0;
  }
  .invoice-meta-table td.lbl {
    color: #64748B;
    font-weight: bold;
    width: 48%;
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
    margin-bottom: 18px;
  }
  .parties-table td {
    width: 50%;
    vertical-align: top;
  }

  .party-box {
    border: 1px solid #CBD5E1;
    border-radius: 7px;
    overflow: hidden;
  }
  
  .party-title {
    background: #2563EB;
    color: white;
    padding: 7px 12px;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .party-details {
    padding: 10px 12px;
    line-height: 1.6;
    background: #F8FAFC;
    color: #334155;
    font-size: 11.5px;
  }

  /* ── Prestations & Fournitures ── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
  }
  
  .items-table thead tr {
    background: #2563EB;
    color: white;
  }
  
  .items-table th {
    padding: 9px 12px;
    font-size: 10.5px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
    letter-spacing: 0.3px;
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
    padding: 10px 12px;
    vertical-align: middle;
  }
  
  .items-table td.r { text-align: right; }
  .items-table td.c { text-align: center; }

  .item-name {
    font-weight: bold;
    color: #0F172A;
    font-size: 11.5px;
  }
  
  .item-sub {
    font-size: 9.5px;
    color: #64748B;
    margin-top: 2px;
  }

  .badge-tag {
    display: inline-block;
    font-size: 8.5px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  
  .badge-soin { background: #DBEAFE; color: #1E40AF; }
  .badge-conso { background: #EDE9FE; color: #6D28D9; }
  .badge-deplacement { background: #FEF3C7; color: #92400E; }

  /* ── Totaux ── */
  .totals-wrapper {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  
  .totals-wrapper td.payment-col {
    width: 50%;
    vertical-align: top;
    padding-right: 16px;
  }
  
  .totals-wrapper td.totals-col {
    width: 50%;
    vertical-align: top;
  }

  .payment-info-box {
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 7px;
    padding: 10px 14px;
    font-size: 11px;
    color: #334155;
    line-height: 1.6;
  }

  .totals-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #CBD5E1;
    border-radius: 7px;
    overflow: hidden;
  }
  
  .totals-table tr {
    border-bottom: 1px solid #E2E8F0;
  }
  
  .totals-table td {
    padding: 8px 14px;
    font-size: 11.5px;
  }
  
  .totals-table td.lbl {
    color: #475569;
    font-weight: bold;
  }
  
  .totals-table td.val {
    text-align: right;
    color: #0F172A;
    font-weight: bold;
  }
  
  .totals-table tr.grand-total {
    background: #2563EB;
    color: white;
  }
  .totals-table tr.grand-total td.lbl,
  .totals-table tr.grand-total td.val {
    color: white;
    font-size: 13px;
    font-weight: bold;
    padding: 10px 14px;
  }

  /* ── Signatures & Cachet ── */
  .signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }
  .signatures-table td {
    width: 50%;
    vertical-align: top;
  }

  .sig-box {
    border: 1px dashed #CBD5E1;
    border-radius: 7px;
    padding: 8px 12px;
    min-height: 60px;
    background: #F8FAFC;
    text-align: center;
  }

  .sig-label {
    font-size: 9px;
    font-weight: bold;
    text-transform: uppercase;
    color: #64748B;
    margin-bottom: 4px;
    text-align: left;
  }

  .thank-you {
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    color: #2563EB;
    margin-bottom: 10px;
  }

  .legal {
    padding-top: 10px;
    border-top: 1px solid #CBD5E1;
    font-size: 9.5px;
    color: #64748B;
    line-height: 1.5;
    text-align: center;
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

<div class="content-container">

  {{-- ══ EN-TÊTE ══ --}}
  <table class="header-table">
    <tr>
      <td style="width: 50%;">
        @if($logoB64)
          <img src="{{ $logoB64 }}" style="width: 110px; height: 110px;" alt="Dar-Soins Logo">
        @else
          <div style="font-size: 22px; font-weight: bold; color: #2563EB;">DAR-SOINS</div>
        @endif
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 22px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">Facture de soins</div>
        <div style="margin-top: 6px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; color: #1E293B;">
          {{ $facture->reference }}
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ METADONNEES ══ --}}
  <table class="header-table" style="margin-bottom: 14px;">
    <tr>
      <td style="width: 50%; font-size: 10.5px; color: #475569; line-height: 1.5;">
        <strong style="font-size: 11.5px; color: #1E293B;">{{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong><br>
        {{ $config->adresse ?? '123 Boulevard d\'Anfa' }}{{ $config->ville ? ', ' . $config->ville : ', Casablanca' }}<br>
        @if($config->telephone) ☎ {{ $config->telephone }} @endif
        @if($config->email_contact) &nbsp;|&nbsp; ✉ {{ $config->email_contact }} @endif
      </td>
      <td style="width: 50%; vertical-align: bottom;">
        <table class="invoice-meta-table">
          <tr>
            <td class="lbl">Date d'émission :</td>
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
      <td style="padding-right: 10px;">
        <div class="party-box">
          <div class="party-title">Facturé à</div>
          <div class="party-details">
            <strong style="color: #0F172A; font-size: 12px;">{{ $intervention->client->user->name ?? 'Patient' }}</strong><br>
            @if(optional($intervention->client->user)->telephone)<strong>Tél :</strong> {{ $intervention->client->user->telephone }}<br>@endif
            @if(optional($intervention->client->user)->email)<strong>Email :</strong> {{ $intervention->client->user->email }}<br>@endif
            <strong>Adresse :</strong> {{ $intervention->localisation->adresse ?? 'Domicile du patient' }}
          </div>
        </div>
      </td>
      <td style="padding-left: 10px;">
        <div class="party-box">
          <div class="party-title">Intervention Réalisée</div>
          <div class="party-details">
            <strong style="color: #0F172A; font-size: 12px;">{{ $intervention->produit->nom ?? 'Soin infirmier' }}</strong><br>
            <strong>Type de prestation :</strong> {{ ucfirst(str_replace('_', ' ', $intervention->type)) }}<br>
            <strong>Soignant intervenant :</strong> {{ $intervention->infirmier->user->name ?? 'Soignant certifié Dar-Soins' }}<br>
            <strong>Date visite :</strong> {{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y') }}
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ PRESTATIONS & FOURNITURES ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 48%;">Désignation de la prestation / Fourniture</th>
        <th class="c" style="width: 14%;">Quantité</th>
        <th class="r" style="width: 19%;">Prix Unitaire HT</th>
        <th class="r" style="width: 19%;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{-- Prestation principale --}}
      <tr>
        <td>
          <span class="badge-tag badge-soin">Acte de soin</span><br>
          <span class="item-name">{{ $intervention->produit->nom ?? 'Soin Infirmier' }}</span>
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            <div class="item-sub">Garde malade qualifiée — {{ $intervention->duree_heures }} heure(s)</div>
          @else
            <div class="item-sub">Soin médical &amp; infirmier à domicile</div>
          @endif
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
            <div class="item-sub">Matériel médical utilisé lors de l'acte</div>
          </td>
          <td class="c">{{ $conso->quantite }} unité(s)</td>
          <td class="r">{{ number_format($consoUHT, 2, ',', ' ') }} {{ $devise }}</td>
          <td class="r"><strong>{{ number_format($consoTotalHT, 2, ',', ' ') }} {{ $devise }}</strong></td>
        </tr>
        @endif
      @endforeach

      {{-- Déplacement si applicable --}}
      @if($fraisDeplacementTTC > 0)
      @php $deplHT = round($fraisDeplacementTTC / $tvaMultiplier, 2); @endphp
      <tr>
        <td>
          <span class="badge-tag badge-deplacement">Déplacement</span><br>
          <span class="item-name">Frais de déplacement soignant</span>
          <div class="item-sub">Trajet aller-retour infirmier sur site</div>
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
          <strong style="text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 4px; color: #1E293B;">Modalités de Règlement</strong>
          Mode de règlement : <strong>{{ ucfirst($intervention->methode_paiement ?: 'Espèces / En ligne') }}</strong><br>
          Montant acquitté : <strong>{{ number_format($totalFactureTTC, 2, ',', ' ') }} {{ $devise }}</strong><br>
          Statut : <span style="color: #16A34A; font-weight: bold;">✓ Facture soldée</span>
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

  {{-- ══ SIGNATURE PATIENT & CACHET ENTREPRISE ══ --}}
  <table class="signatures-table">
    <tr>
      <td style="padding-right: 10px;">
        <div class="sig-box">
          <div class="sig-label">Signature du Patient / Bénéficiaire</div>
          @if($intervention->signature_patient)
            <img src="{{ $intervention->signature_patient }}" style="max-height: 40px; max-width: 140px; display: inline-block; margin-top: 1px;" alt="Signature Patient">
          @else
            <div style="height: 38px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 10px; color: #16A34A; font-weight: bold;">✓ Émargé lors de la visite soignante</span>
            </div>
          @endif
        </div>
      </td>
      <td style="padding-left: 10px;">
        <div class="sig-box" style="background: #FFFFFF;">
          <div class="sig-label">Cachet &amp; Visa de l'entreprise</div>
          @if($cachetB64)
            <img src="{{ $cachetB64 }}" style="max-height: 40px; max-width: 130px; display: inline-block; margin-top: 1px;" alt="Cachet Dar-Soins">
          @else
            <div style="font-size: 9px; color: #94A3B8; padding-top: 10px;">Cachet officiel Dar-Soins</div>
          @endif
        </div>
      </td>
    </tr>
  </table>

  <div class="thank-you">Dar-Soins vous remercie de votre confiance. Prenez soin de vous !</div>

  {{-- ══ MENTIONS LEGALES ══ --}}
  <div class="legal">
    <strong>{{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong>
    @if($config->rc) — RC {{ $config->rc }} @endif
    @if($config->if_fiscal) — IF {{ $config->if_fiscal }} @endif
    @if($config->ice) — ICE {{ $config->ice }} @endif
    @if($config->patente) — Patente {{ $config->patente }} @endif<br>
    @if($config->adresse) {{ $config->adresse }}, @endif
    {{ $config->ville ?? '' }} {{ $config->code_postal ?? '' }}
    @if($config->site_web) — <strong>{{ $config->site_web }}</strong> @endif
  </div>

</div>

<div class="bottom-bar"></div>

</body>
</html>
