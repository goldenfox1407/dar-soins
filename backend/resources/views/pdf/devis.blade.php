<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis DEV-{{ str_pad($devis->id, 5, '0', STR_PAD_LEFT) }}</title>
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

  /* ── Mentions Légales & Footer ── */
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

  // Prix du soin net TTC
  $prixSoinTTC = (float)($intervention->produit->prix_client ?? 0);
  if ($intervention->produit && $intervention->produit->type_remise === 'percent' && $intervention->produit->valeur_remise > 0) {
      $prixSoinTTC -= $prixSoinTTC * ($intervention->produit->valeur_remise / 100);
  } elseif ($intervention->produit && $intervention->produit->type_remise === 'fixed' && $intervention->produit->valeur_remise > 0) {
      $prixSoinTTC -= (float)$intervention->produit->valeur_remise;
  }
  $prixSoinTTC = max(0, $prixSoinTTC);

  $quantiteSoin = ($intervention->type === 'garde_malade' && $intervention->duree_heures > 0) ? (float)$intervention->duree_heures : 1;
  $totalSoinTTC = $prixSoinTTC * $quantiteSoin;
  $fraisDeplacementTTC = (float)($devis->frais_deplacement ?? 0);

  $totalTTC = round($totalSoinTTC + $fraisDeplacementTTC, 2);
  $totalHT  = round($totalTTC / $tvaMultiplier, 2);
  $totalTVA = round($totalTTC - $totalHT, 2);

  $prixSoinHT = round($prixSoinTTC / $tvaMultiplier, 2);
  $totalSoinHT = round($totalSoinTTC / $tvaMultiplier, 2);
  $fraisDeplacementHT = round($fraisDeplacementTTC / $tvaMultiplier, 2);

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
        <div style="font-size: 20px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">Devis de soins</div>
        <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; color: #1E293B;">
          DEV-{{ str_pad($devis->id, 5, '0', STR_PAD_LEFT) }}
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ METADONNEES ══ --}}
  <table class="header-table" style="margin-bottom: 6px;">
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
            <td class="val">{{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}</td>
          </tr>
          <tr>
            <td class="lbl">Prévu pour :</td>
            <td class="val">{{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y à H:i') }}</td>
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
    <strong>⚠ Devis estimatif officiel</strong> — Ce document est une estimation conforme de la prestation demandée.
  </div>

  {{-- ══ PARTIES COTE A COTE ══ --}}
  <table class="parties-table">
    <tr>
      <td style="padding-right: 8px;">
        <div class="party-box">
          <div class="party-title">Bénéficiaire du soin</div>
          <div class="party-details">
            <strong style="color: #000000; font-size: 11px;">{{ $intervention->client->user->name ?? 'Patient' }}</strong><br>
            @if(optional($intervention->client->user)->telephone)<strong>Tél :</strong> {{ $intervention->client->user->telephone }}<br>@endif
            @if(optional($intervention->client->user)->email)<strong>Email :</strong> {{ $intervention->client->user->email }}<br>@endif
            <strong>Lieu :</strong> {{ $intervention->localisation->adresse ?? 'Domicile du patient' }}
          </div>
        </div>
      </td>
      <td style="padding-left: 8px;">
        <div class="party-box">
          <div class="party-title">Prestation Demandée</div>
          <div class="party-details">
            <strong style="color: #000000; font-size: 11px;">{{ $intervention->produit->nom ?? 'Soin infirmier' }}</strong><br>
            <strong>Type de soin :</strong> {{ ucfirst(str_replace('_', ' ', $intervention->type)) }}<br>
            @if($intervention->description_probleme)
              <strong>Précisions :</strong> {{ Str::limit($intervention->description_probleme, 60) }}<br>
            @endif
            <strong>Soignant assigné :</strong> {{ $intervention->infirmier->user->name ?? 'Soignant certifié Dar-Soins' }}
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ PRESTATIONS ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%;">Description de la prestation</th>
        <th class="c" style="width: 12%;">Qté / Durée</th>
        <th class="r" style="width: 18%;">Prix Unitaire HT</th>
        <th class="r" style="width: 20%;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{-- Prestation principale --}}
      <tr>
        <td>
          <span class="badge-tag badge-soin">Acte de soin</span><br>
          <span class="item-name">{{ $intervention->produit->nom ?? 'Soin Infirmier' }}</span>
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            <div class="item-sub">Garde malade — {{ $intervention->duree_heures }}h</div>
          @else
            <div class="item-sub">Intervention soignante à domicile</div>
          @endif
        </td>
        <td class="c">{{ $quantiteSoin }}{{ $intervention->type === 'garde_malade' ? ' h' : ' act.' }}</td>
        <td class="r">{{ number_format($prixSoinHT, 2, ',', ' ') }} {{ $devise }}</td>
        <td class="r"><strong>{{ number_format($totalSoinHT, 2, ',', ' ') }} {{ $devise }}</strong></td>
      </tr>

      {{-- Déplacement si applicable --}}
      @if($fraisDeplacementTTC > 0)
      <tr>
        <td>
          <span class="badge-tag badge-deplacement">Déplacement</span><br>
          <span class="item-name">Frais de déplacement soignant</span>
          <div class="item-sub">Prise en charge trajet aller-retour</div>
        </td>
        <td class="c">1 forf.</td>
        <td class="r">{{ number_format($fraisDeplacementHT, 2, ',', ' ') }} {{ $devise }}</td>
        <td class="r"><strong>{{ number_format($fraisDeplacementHT, 2, ',', ' ') }} {{ $devise }}</strong></td>
      </tr>
      @endif
    </tbody>
  </table>

  {{-- ══ TOTAUX ══ --}}
  <table class="totals-wrapper">
    <tr>
      <td class="payment-col">
        <div class="validity-box">
          <strong style="text-transform: uppercase; font-size: 9.5px; display: block; margin-bottom: 4px;">Conditions &amp; Validité</strong>
          Devis valable <strong>{{ $config->delai_validite_devis_j ?? 30 }} jours</strong> à compter du {{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}.<br>
          Paiement sécurisé par carte bancaire ou espèces lors de l'intervention.
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
            <td class="lbl">TOTAL ESTIMÉ TTC</td>
            <td class="val">{{ number_format($totalTTC, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div class="thank-you">Dar-Soins — Votre santé, notre priorité à domicile.</div>

  {{-- ══ CACHET ══ --}}
  @if($cachetB64)
  <div style="text-align: center; margin-bottom: 10px; margin-top: 6px;">
    <div style="font-size: 8px; font-weight: bold; text-transform: uppercase; color: #64748B; margin-bottom: 2px;">Cachet &amp; Visa de l'entreprise</div>
    <img src="{{ $cachetB64 }}" style="max-height: 48px; max-width: 120px; display: inline-block;" alt="Cachet Dar-Soins">
  </div>
  @endif

  {{-- ══ MENTIONS LEGALES ══ --}}
  <div class="legal">
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
