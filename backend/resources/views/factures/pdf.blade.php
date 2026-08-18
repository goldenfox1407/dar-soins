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
    font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
    color: #1E293B;
    font-size: 11px;
    line-height: 1.45;
    background: #fff;
  }

  .top-bar {
    background: linear-gradient(to right, #2563EB 0%, #10B981 100%);
    height: 6px;
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
    font-size: 11px;
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

  .status-badge {
    background: #FEF3C7;
    color: #D97706;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 9px;
    text-transform: uppercase;
  }
  
  .payment-badge {
    background: #D1FAE5;
    color: #065F46;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 9px;
    text-transform: uppercase;
  }

  /* ── Blocs parties côte à côte ── */
  .parties-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
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
    font-size: 10.5px;
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
    margin-bottom: 15px;
  }
  
  .items-table thead tr {
    background: #2563EB;
    color: white;
  }
  
  .items-table th {
    padding: 8px 10px;
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
    font-size: 11px;
  }
  
  .item-sub {
    font-size: 9.5px;
    color: #64748B;
    margin-top: 1px;
  }

  .badge-tag {
    display: inline-block;
    font-size: 8.5px;
    font-weight: bold;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  
  .badge-soin { background: #DBEAFE; color: #1E40AF; }
  .badge-conso { background: #D1FAE5; color: #065F46; }
  .badge-deplacement { background: #FEF3C7; color: #92400E; }

  /* ── Totaux ── */
  .totals-wrapper {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
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
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 10px;
    color: #166534;
    line-height: 1.5;
  }
  .payment-info-box strong.title {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    color: #15803D;
    margin-bottom: 4px;
    font-weight: bold;
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
    font-size: 11px;
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
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .totals-table tr.recu {
    background: #F0FDF4;
  }
  .totals-table tr.recu td.lbl,
  .totals-table tr.recu td.val {
    color: #166534;
  }

  /* ── Signatures & Cachet ── */
  .signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }
  
  .signatures-table td {
    width: 50%;
    vertical-align: top;
  }
  
  .sig-box {
    border: 1px dashed #CBD5E1;
    border-radius: 6px;
    padding: 8px;
    min-height: 85px;
    background: #FAFAFA;
    text-align: center;
  }
  
  .sig-label {
    font-size: 8.5px;
    font-weight: bold;
    text-transform: uppercase;
    color: #64748B;
    margin-bottom: 6px;
  }
  
  .sig-img {
    max-height: 48px;
    max-width: 140px;
  }
  
  .sig-empty {
    color: #CBD5E1;
    font-style: italic;
    font-size: 10px;
    margin-top: 12px;
  }

  /* ── Mentions Légales & Footer ── */
  .legal {
    padding-top: 8px;
    border-top: 1px solid #E2E8F0;
    font-size: 9.5px;
    color: #64748B;
    line-height: 1.5;
    text-align: center;
  }
  .legal strong {
    color: #475569;
  }

  .thank-you {
    text-align: center;
    font-size: 13px;
    font-weight: bold;
    color: #2563EB;
    margin-bottom: 12px;
  }

  .bottom-bar {
    background: linear-gradient(to right, #10B981 0%, #2563EB 100%);
    height: 4px;
    width: 100%;
    margin-top: 12px;
  }
</style>
</head>
<body>

<div class="top-bar"></div>

@php
  $logoPath = public_path('images/logo.png');
  $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : '';
@endphp

<div style="padding: 0 10px;">

  {{-- ══ EN-TÊTE ══ --}}
  <table class="header-table">
    <tr>
      <td style="width: 50%;">
        @if($logoBase64)
          <img src="{{ $logoBase64 }}" style="width: 120px; height: 120px;" alt="Dar-Soins Logo">
        @else
          <div style="font-size: 20px; font-weight: bold; color: #2563EB;">DAR-SOINS</div>
        @endif
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 22px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">Facture de soins</div>
        <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; color: #1E293B;">
          {{ $facture->reference }}
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ METADONNEES ══ --}}
  <table class="header-table" style="margin-bottom: 10px;">
    <tr>
      <td style="width: 50%; font-size: 10px; color: #475569; line-height: 1.5;">
        <strong>{{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong><br>
        {{ $config->adresse ?? '' }}{{ $config->ville ? ', ' . $config->ville : '' }}<br>
        @if($config->telephone) ☎ {{ $config->telephone }} @endif
        @if($config->email_contact) &nbsp;|&nbsp; ✉ {{ $config->email_contact }} @endif
      </td>
      <td style="width: 50%; vertical-align: bottom;">
        <table class="invoice-meta-table">
          <tr>
            <td class="lbl">Date :</td>
            <td class="val">{{ $facture->created_at->format('d/m/Y H:i') }}</td>
          </tr>
          <tr>
            <td class="lbl">Statut :</td>
            <td class="val">
              <span class="status-badge">{{ $facture->statut ?? 'En attente' }}</span>
            </td>
          </tr>
          <tr>
            <td class="lbl">Paiement :</td>
            <td class="val">
              <span class="payment-badge">{{ ucfirst($intervention->methode_paiement ?: 'Non specifie') }}</span>
            </td>
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
            <strong style="color: #000000; font-size: 11.5px;">{{ $intervention->client->user->name }}</strong><br>
            @if($intervention->client->user->telephone)<strong>Tél :</strong> {{ $intervention->client->user->telephone }}<br>@endif
            <strong>Email :</strong> {{ $intervention->client->user->email }}<br>
            <strong>Adresse :</strong> {{ $intervention->localisation->adresse ?? 'Adresse non renseignee' }}
          </div>
        </div>
      </td>
      <td style="padding-left: 8px;">
        <div class="party-box">
          <div class="party-title">Intervenant Soignant</div>
          <div class="party-details">
            <strong style="color: #000000; font-size: 11.5px;">{{ $intervention->infirmier->user->name }}</strong><br>
            <strong>Qualité :</strong> Infirmier(e) diplômé(e)<br>
            <strong>Intervention :</strong> {{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y H:i') }}<br>
            <strong>Adresse :</strong> Soins médicaux à domicile
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ PRESTATIONS ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 48%;">Description de la prestation</th>
        <th class="c" style="width: 12%;">Quantité</th>
        <th class="r" style="width: 20%;">Prix unitaire</th>
        <th class="r" style="width: 20%;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{-- Prestation principale --}}
      <tr>
        <td>
          <span class="badge-tag badge-soin">Prestation</span><br>
          <span class="item-name">{{ $intervention->produit->nom }}</span>
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            <div class="item-sub">Garde malade — {{ $intervention->duree_heures }}h</div>
          @else
            <div class="item-sub">Soin infirmier à domicile</div>
          @endif
        </td>
        <td class="c">1</td>
        <td class="r">{{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
        <td class="r">{{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
      </tr>

      {{-- Consommables --}}
      @foreach($intervention->consommations as $conso)
        @if($conso->produit)
        <tr>
          <td>
            <span class="badge-tag badge-conso">Consommable</span><br>
            <span class="item-name">{{ $conso->produit->nom }}</span>
            <div class="item-sub">Matériel médical utilisé</div>
          </td>
          <td class="c">{{ $conso->quantite }}</td>
          <td class="r">{{ number_format($conso->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          <td class="r">{{ number_format($conso->quantite * $conso->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
        </tr>
        @endif
      @endforeach

      {{-- Déplacement --}}
      @php
        $totalLignes = $intervention->produit->prix_client;
        foreach($intervention->consommations as $conso) {
            if($conso->produit) $totalLignes += ($conso->quantite * $conso->produit->prix_client);
        }
        $tva = (float)($config->tva ?? 20);
        $devise = $config->devise_defaut ?? 'MAD';
        $montantTTC = $facture->montant_total;
        $montantHT  = $montantTTC / (1 + $tva / 100);
        $fraisDeplacement = $montantHT - $totalLignes;
      @endphp

      @if($fraisDeplacement > 0.01)
      <tr>
        <td>
          <span class="badge-tag badge-deplacement">Déplacement</span><br>
          <span class="item-main">Frais de déplacement</span>
          <div class="item-sub">
            @if($intervention->distance_manuelle)
              {{ $intervention->distance_manuelle }} km
            @else
              Forfait kilométrique
            @endif
          </div>
        </td>
        <td class="c">1</td>
        <td class="r">{{ number_format($fraisDeplacement, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
        <td class="r">{{ number_format($fraisDeplacement, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
      </tr>
      @endif
    </tbody>
  </table>

  {{-- ══ TOTAUX ══ --}}
  <table class="totals-wrapper">
    <tr>
      <td class="payment-col">
        <div class="payment-info-box">
          <strong class="title">Mode de règlement</strong>
          Mode : {{ ucfirst($intervention->methode_paiement ?: 'Non specifie') }}<br>
          Montant reçu : <strong>{{ number_format((float)$intervention->montant_recu, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</strong><br>
          @if($config->conditions_paiement)
            {{ $config->conditions_paiement }}
          @else
            RIB : 007 780 0004567890123456 78<br>
            Banque : Attijariwafa Bank — Casablanca
          @endif
        </div>
      </td>
      <td class="totals-col">
        <table class="totals-table">
          <tr>
            <td class="lbl">Sous-total HT</td>
            <td class="val">{{ number_format($montantHT, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          <tr>
            <td class="lbl">TVA ({{ $tva }}%)</td>
            <td class="val">{{ number_format($montantTTC - $montantHT, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          <tr class="grand-total">
            <td class="lbl">TOTAL TTC</td>
            <td class="val">{{ number_format($montantTTC, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          @if($intervention->montant_recu > 0)
          <tr class="recu">
            <td class="lbl">✓ Montant reçu</td>
            <td class="val">{{ number_format((float)$intervention->montant_recu, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          @endif
        </table>
      </td>
    </tr>
  </table>

  <div class="thank-you">Merci pour votre confiance !</div>

  {{-- ══ VISAS & CACHET ══ --}}
  <table class="signatures-table">
    <tr>
      <td style="padding-right: 8px;">
        <div class="sig-box">
          <div class="sig-label">Signature du Patient</div>
          @if($intervention->signature_patient)
            <img src="{{ $intervention->signature_patient }}" class="sig-img" alt="Signature">
          @else
            <div class="sig-empty">Aucune signature</div>
          @endif
        </div>
      </td>
      <td style="padding-left: 8px; text-align: center;">
        <div class="sig-box" style="background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div class="sig-label" style="margin-bottom: 2px;">Cachet &amp; Visa de l'entreprise</div>
          <img src="{{ public_path('images/cachet.jpg') }}" style="max-height: 60px; max-width: 140px; margin-top: 1px;" alt="Cachet Dar-Soins">
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ MENTIONS LEGALES ══ --}}
  <div class="legal">
    @if($config->mentions_facture)
      {{ $config->mentions_facture }}<br>
    @else
      <strong>Conditions de règlement :</strong> Règlement à la fin de l'intervention.<br>
    @endif
    {{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}
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
