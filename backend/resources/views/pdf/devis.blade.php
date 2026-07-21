<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis {{ $devis->id }}</title>
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

  .estimate-banner {
    background: #FFF7ED;
    border: 1px solid #FED7AA;
    border-left: 3px solid #F97316;
    border-radius: 4px;
    padding: 6px 12px;
    margin-bottom: 12px;
    font-size: 10px;
    color: #9A3412;
    line-height: 1.4;
  }
  .estimate-banner strong {
    color: #7C2D12;
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

  .validity-box {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 10px;
    color: #1E40AF;
    line-height: 1.4;
  }
  .validity-box strong {
    color: #1D4ED8;
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
  }
  
  .sig-label {
    font-size: 8.5px;
    font-weight: bold;
    text-transform: uppercase;
    color: #64748B;
    margin-bottom: 6px;
  }
  
  .sig-text {
    font-size: 10px;
    color: #94A3B8;
  }
  
  .sig-line {
    border-bottom: 1px solid #E2E8F0;
    margin: 6px 0;
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

<div style="padding: 0 10px;">

  {{-- ══ EN-TÊTE ══ --}}
  <table class="header-table">
    <tr>
      <td style="width: 50%;">
        <img src="{{ public_path('images/logo.png') }}" style="width: 130px; height: 130px;" alt="Dar-Soins Logo">
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 22px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">Devis de soins</div>
        <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; color: #1E293B;">
          DEV-{{ str_pad($devis->id, 5, '0', STR_PAD_LEFT) }}
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ METADONNEES ══ --}}
  <table class="header-table" style="margin-bottom: 6px;">
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
            <td class="lbl">Date émission :</td>
            <td class="val">{{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}</td>
          </tr>
          <tr>
            <td class="lbl">Prévu pour :</td>
            <td class="val">{{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y H:i') }}</td>
          </tr>
          <tr>
            <td class="lbl">Validité :</td>
            <td class="val">{{ $config->delai_validite_devis_j ?? 30 }} jours</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- ══ BANDEAU ESTIMATIF ══ --}}
  <div class="estimate-banner">
    <strong>⚠ Devis estimatif — Non contractuel</strong><br>
    Ce document est une estimation basée sur les informations fournies. Le montant final pourra varier selon les consommables réels utilisés lors de l'intervention.
  </div>

  {{-- ══ PARTIES COTE A COTE ══ --}}
  <table class="parties-table">
    <tr>
      <td style="padding-right: 8px;">
        <div class="party-box">
          <div class="party-title">Établi pour</div>
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
          <div class="party-title">Prestation Demandée</div>
          <div class="party-details">
            <strong style="color: #000000; font-size: 11.5px;">{{ $intervention->produit->nom }}</strong><br>
            <strong>Type de soin :</strong> {{ ucfirst(str_replace('_', ' ', $intervention->type)) }}<br>
            @if($intervention->description_probleme)
              <strong>Détails :</strong> {{ Str::limit($intervention->description_probleme, 60) }}<br>
            @else
              <strong>Détails :</strong> Soin infirmier à domicile<br>
            @endif
            <strong>Lieu :</strong> Domicile du patient
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ PRESTATIONS ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 55%;">Description des prestations estimées</th>
        <th class="r" style="width: 22%;">Prix unitaire</th>
        <th class="r" style="width: 23%;">Montant estimé HT</th>
      </tr>
    </thead>
    <tbody>
      {{-- Prestation principale --}}
      <tr>
        <td>
          <span class="badge-tag badge-soin">Prestation</span><br>
          <span class="item-name">{{ $intervention->produit->nom }}</span>
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            <div class="item-sub">Garde malade — {{ $intervention->duree_heures }}h × {{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}/h</div>
          @else
            <div class="item-sub">Soin infirmier à domicile</div>
          @endif
        </td>
        <td class="r">{{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
        <td class="r">
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            {{ number_format($intervention->produit->prix_client * $intervention->duree_heures, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}
          @else
            {{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}
          @endif
        </td>
      </tr>

      {{-- Déplacement --}}
      @if($devis->frais_deplacement > 0)
      <tr>
        <td>
          <span class="badge-tag badge-deplacement">Déplacement</span><br>
          <span class="item-name">Frais de déplacement</span>
          <div class="item-sub">Forfait kilométrique estimé</div>
        </td>
        <td class="r">—</td>
        <td class="r">{{ number_format($devis->frais_deplacement, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
      </tr>
      @endif

      <tr style="background:#FFF7ED;">
        <td colspan="2" style="font-size:10px;color:#92400E;font-style:italic;padding:8px 10px;">
          * Consommables médicaux éventuels non inclus — seront facturés après intervention selon utilisation.
        </td>
        <td class="r" style="color:#92400E;font-style:italic;font-size:10px;">Variable</td>
      </tr>
    </tbody>
  </table>

  {{-- ══ TOTAUX ══ --}}
  @php
    $tva = (float)($config->tva ?? 20);
    $devise = $config->devise_defaut ?? 'MAD';
    $montantTTC = $devis->montant_estime;
    $montantHT  = $montantTTC / (1 + $tva / 100);
  @endphp
  <table class="totals-wrapper">
    <tr>
      <td class="payment-col">
        <div class="validity-box">
          <strong style="text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 4px;">Validité du devis</strong>
          Ce devis est valable <strong>{{ $config->delai_validite_devis_j ?? 30 }} jours</strong> à compter du {{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}.<br>
          <strong>Tél :</strong> {{ $config->telephone ?? '—' }} &nbsp;|&nbsp; <strong>Email :</strong> {{ $config->email_contact ?? '—' }}
        </div>
      </td>
      <td class="totals-col">
        <table class="totals-table">
          <tr>
            <td class="lbl">Sous-total HT</td>
            <td class="val">{{ number_format($montantHT, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr>
            <td class="lbl">TVA ({{ $tva }}%)</td>
            <td class="val">{{ number_format($montantTTC - $montantHT, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr class="grand-total">
            <td class="lbl">TOTAL ESTIMÉ TTC</td>
            <td class="val">{{ number_format($montantTTC, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div class="thank-you">Merci pour votre confiance !</div>

  {{-- ══ CACHET ══ --}}
  <div style="text-align: center; margin-bottom: 15px; margin-top: 10px;">
    <div style="font-size: 8.5px; font-weight: bold; text-transform: uppercase; color: #64748B; margin-bottom: 4px;">Cachet &amp; Visa de l'entreprise</div>
    <img src="{{ public_path('images/cachet.jpg') }}" style="max-height: 65px; max-width: 140px; display: inline-block;" alt="Cachet Dar-Soins">
  </div>

  {{-- ══ MENTIONS LEGALES ══ --}}
  <div class="legal">
    <strong>Document non contractuel — Estimation soumise à validation lors des soins.</strong><br>
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
