<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture {{ $facture->reference }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
    color: #1E293B;
    font-size: 13px;
    line-height: 1.55;
    background: #fff;
    padding: 0;
  }

  /* ── Bande supérieure ── */
  .top-bar {
    background: linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%);
    height: 8px;
    width: 100%;
  }

  .page { padding: 32px 40px 28px; }

  /* ── En-tête ── */
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .header-table td { vertical-align: top; }

  .logo-zone { width: 55%; }

  .logo-icon-row { display: table; }
  .logo-icon { display: table-cell; vertical-align: middle; }
  .logo-text { display: table-cell; vertical-align: middle; padding-left: 12px; }
  .logo-name { font-size: 28px; font-weight: 700; color: #1E293B; letter-spacing: -0.5px; line-height: 1; }
  .logo-name span { color: #0D9488; }
  .logo-tagline { font-size: 9.5px; color: #64748B; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 3px; }
  .logo-divider { width: 160px; height: 1.5px; background: #0D9488; margin-top: 5px; opacity: 0.5; }

  .company-address {
    margin-top: 14px;
    font-size: 11.5px;
    color: #475569;
    line-height: 1.7;
  }
  .company-address strong { color: #1E293B; font-size: 12px; }

  .invoice-meta { width: 45%; text-align: right; }
  .invoice-badge {
    display: inline-block;
    background: linear-gradient(135deg, #1E3A8A, #0D9488);
    color: white;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 4px;
    padding: 8px 22px;
    border-radius: 6px;
    margin-bottom: 14px;
  }
  .invoice-ref { font-size: 13px; color: #64748B; margin-bottom: 10px; }
  .invoice-ref strong { color: #1E293B; }
  .invoice-dates { font-size: 12px; color: #475569; line-height: 1.8; }
  .invoice-dates strong { color: #1E293B; }

  /* ── Séparateur ── */
  .divider { height: 1px; background: linear-gradient(to right, #1E3A8A22, #0D948844, #1E3A8A22); margin: 0 0 24px; }

  /* ── Blocs client / infirmier ── */
  .parties-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  .parties-table td { width: 50%; vertical-align: top; }
  .party-box {
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 14px 16px;
    background: #F8FAFC;
    position: relative;
    overflow: hidden;
  }
  .party-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
    background: linear-gradient(to bottom, #1E3A8A, #0D9488);
    border-radius: 8px 0 0 8px;
  }
  .party-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #0D9488;
    margin-bottom: 6px;
  }
  .party-name { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 3px; }
  .party-detail { font-size: 11.5px; color: #475569; line-height: 1.7; }

  /* ── Tableau des prestations ── */
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table thead tr {
    background: #0F172A;
    color: white;
  }
  .items-table th {
    padding: 11px 14px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-align: left;
  }
  .items-table th.r { text-align: right; }
  .items-table th.c { text-align: center; }

  .items-table tbody tr { border-bottom: 1px solid #E2E8F0; }
  .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
  .items-table td { padding: 11px 14px; vertical-align: middle; }
  .items-table td.r { text-align: right; }
  .items-table td.c { text-align: center; }

  .item-main { font-weight: 600; color: #1E293B; font-size: 13px; }
  .item-sub { font-size: 11px; color: #64748B; margin-top: 2px; }

  .badge-soin {
    display: inline-block;
    background: #DBEAFE;
    color: #1E40AF;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 2px 7px;
    border-radius: 20px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .badge-conso {
    display: inline-block;
    background: #D1FAE5;
    color: #065F46;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 2px 7px;
    border-radius: 20px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .badge-deplacement {
    display: inline-block;
    background: #FEF3C7;
    color: #92400E;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 2px 7px;
    border-radius: 20px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  /* ── Totaux ── */
  .totals-wrapper { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .totals-wrapper td:first-child { width: 55%; vertical-align: top; }
  .totals-wrapper td:last-child { width: 45%; vertical-align: top; }

  .payment-info {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 12px;
    color: #166534;
  }
  .payment-info strong { display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #15803D; margin-bottom: 6px; }

  .totals-box { border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
  .totals-row { display: table; width: 100%; border-collapse: collapse; }
  .totals-line { border-bottom: 1px solid #E2E8F0; }
  .totals-line td { padding: 9px 16px; font-size: 12.5px; }
  .totals-line td.lbl { color: #475569; font-weight: 600; }
  .totals-line td.val { text-align: right; color: #1E293B; font-weight: 600; }
  .totals-line.tva td { background: #F8FAFC; }
  .totals-line.grand-total td {
    background: linear-gradient(135deg, #1E3A8A, #0D9488);
    color: white !important;
    font-size: 15px;
    font-weight: 700;
    padding: 12px 16px;
  }
  .totals-line.grand-total td.lbl { color: white; }
  .totals-line.grand-total td.val { color: white; }
  .totals-line.recu td { background: #F0FDF4; }
  .totals-line.recu td.lbl { color: #166534; }
  .totals-line.recu td.val { color: #166534; }

  /* ── Pied de page : signature + cachet ── */
  .footer-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .footer-table td { width: 50%; vertical-align: top; text-align: center; }

  .sig-box {
    border: 1px dashed #CBD5E1;
    border-radius: 8px;
    padding: 16px;
    min-height: 110px;
    background: #FAFAFA;
  }
  .sig-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; margin-bottom: 10px; }
  .sig-img { max-height: 70px; max-width: 180px; }
  .sig-empty { color: #CBD5E1; font-style: italic; font-size: 11px; margin-top: 20px; }

  .cachet-box { padding: 8px; }
  .cachet-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; margin-bottom: 8px; }

  /* ── Mentions légales ── */
  .legal {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid #E2E8F0;
    font-size: 10.5px;
    color: #94A3B8;
    line-height: 1.7;
    text-align: center;
  }
  .legal strong { color: #64748B; }

  /* ── Bande inférieure ── */
  .bottom-bar {
    background: linear-gradient(135deg, #0D9488 0%, #1E3A8A 100%);
    height: 5px;
    width: 100%;
    margin-top: 20px;
  }
</style>
</head>
<body>

<div class="top-bar"></div>
<div class="page">

  {{-- ══ EN-TÊTE ══ --}}
  <table class="header-table">
    <tr>
      <td class="logo-zone">
        {{-- Logo inline SVG --}}
        <table style="border:none;padding:0;margin:0;">
          <tr>
            <td style="vertical-align:middle;padding:0;border:none;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="62" height="62">
                <defs>
                  <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1E3A8A"/>
                    <stop offset="100%" style="stop-color:#0D9488"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="68" height="68" rx="14" fill="url(#lg1)"/>
                <path d="M32 16 A18 18 0 1 0 32 56 A12 12 0 1 1 32 16Z" fill="white" opacity="0.93"/>
                <rect x="40" y="28" width="20" height="7" rx="3.5" fill="#10B981"/>
                <rect x="47" y="21" width="7" height="21" rx="3.5" fill="#10B981"/>
              </svg>
            </td>
            <td style="vertical-align:middle;padding-left:12px;border:none;">
              <div class="logo-name">Dar<span>-Soins</span></div>
              <div class="logo-tagline">Soins Infirmiers à Domicile</div>
              <div class="logo-divider"></div>
            </td>
          </tr>
        </table>
        <div class="company-address">
          <strong>{{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong><br>
          {{ $config->adresse ?? '' }}{{ $config->ville ? ', ' . $config->ville : '' }}<br>
          {{ $config->code_postal ?? '' }} {{ $config->pays ?? 'Maroc' }}<br>
          @if($config->telephone) ☎ {{ $config->telephone }} &nbsp;|&nbsp; @endif
          @if($config->email_contact) ✉ {{ $config->email_contact }} @endif<br>
          @if($config->rc) RC : {{ $config->rc }} @endif
          @if($config->ice) &nbsp;|&nbsp; ICE : {{ $config->ice }} @endif
        </div>
      </td>
      <td class="invoice-meta">
        <div class="invoice-badge">FACTURE</div>
        <div class="invoice-ref">
          Référence : <strong>{{ $facture->reference }}</strong>
        </div>
        <div class="invoice-dates">
          <strong>Date d'émission :</strong> {{ $facture->created_at->format('d/m/Y') }}<br>
          <strong>Date d'intervention :</strong> {{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y') }}<br>
          <strong>Paiement :</strong> {{ ucfirst($intervention->methode_paiement ?: 'Non spécifié') }}
        </div>
      </td>
    </tr>
  </table>

  <div class="divider"></div>

  {{-- ══ PARTIES ══ --}}
  <table class="parties-table">
    <tr>
      <td style="padding-right:12px;">
        <div class="party-box">
          <div class="party-label">Facturé à</div>
          <div class="party-name">{{ $intervention->client->user->name }}</div>
          <div class="party-detail">
            {{ $intervention->client->user->email }}<br>
            @if($intervention->localisation)
              {{ $intervention->localisation->adresse ?? 'Adresse non renseignée' }}
            @endif
          </div>
        </div>
      </td>
      <td style="padding-left:12px;">
        <div class="party-box">
          <div class="party-label">Soignant intervenant</div>
          <div class="party-name">{{ $intervention->infirmier->user->name }}</div>
          <div class="party-detail">
            Infirmier(e) diplômé(e)<br>
            Intervention du {{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y à H:i') }}
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ TABLEAU PRESTATIONS ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:46%;">Description</th>
        <th class="c" style="width:12%;">Qté</th>
        <th class="r" style="width:21%;">Prix unitaire</th>
        <th class="r" style="width:21%;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{-- Prestation principale --}}
      <tr>
        <td>
          <span class="badge-soin">Prestation médicale</span><br>
          <span class="item-main">{{ $intervention->produit->nom }}</span>
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
            <span class="badge-conso">Consommable</span><br>
            <span class="item-main">{{ $conso->produit->nom }}</span>
            <div class="item-sub">Matériel médical utilisé</div>
          </td>
          <td class="c">{{ $conso->quantite }}</td>
          <td class="r">{{ number_format($conso->produit->prix_client, 2, ',', ' ') }} MAD</td>
          <td class="r">{{ number_format($conso->quantite * $conso->produit->prix_client, 2, ',', ' ') }} MAD</td>
        </tr>
        @endif
      @endforeach

      {{-- Frais de déplacement --}}
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
          <span class="badge-deplacement">Déplacement</span><br>
          <span class="item-main">Frais kilométriques</span>
          <div class="item-sub">
            @if($intervention->distance_manuelle)
              {{ $intervention->distance_manuelle }} km
            @else
              Forfait déplacement
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
      <td style="padding-right:16px;">
        <div class="payment-info">
          <strong>Informations de paiement</strong>
          Mode : {{ ucfirst($intervention->methode_paiement ?: 'Non specifie') }}<br>
          Montant recu : <strong>{{ number_format((float)$intervention->montant_recu, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</strong><br><br>
          @if($config->conditions_paiement)
            {{ $config->conditions_paiement }}
          @else
            RIB : 007 780 0004567890123456 78<br>
            Banque : Attijariwafa Bank — Casablanca
          @endif
        </div>
      </td>
      <td>
        <table class="totals-box" style="width:100%;border-collapse:collapse;">
          <tr class="totals-line">
            <td class="lbl">Sous-total HT</td>
            <td class="val">{{ number_format($montantHT, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          <tr class="totals-line tva">
            <td class="lbl">TVA ({{ $tva }}%)</td>
            <td class="val">{{ number_format($montantTTC - $montantHT, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          <tr class="totals-line grand-total">
            <td class="lbl">TOTAL TTC</td>
            <td class="val">{{ number_format($montantTTC, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
          <tr class="totals-line recu">
            <td class="lbl">✓ Montant reçu</td>
            <td class="val">{{ number_format((float)$intervention->montant_recu, 2, ',', ' ') }} {{ $devise ?? 'MAD' }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- ══ SIGNATURE + CACHET ══ --}}
  <table class="footer-table">
    <tr>
      <td style="padding-right:16px;">
        <div class="sig-box">
          <div class="sig-label">Signature du patient</div>
          @if($intervention->signature_patient)
            <img src="{{ $intervention->signature_patient }}" class="sig-img" alt="Signature">
          @else
            <div class="sig-empty">Aucune signature enregistrée</div>
          @endif
        </div>
      </td>
      <td style="padding-left:16px;">
        <div class="cachet-box">
          <div class="cachet-label">Cachet &amp; Visa de l'entreprise</div>
          {{-- Cachet SVG inline --}}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="130" height="130" style="opacity:0.88;">
            <circle cx="100" cy="100" r="94" fill="none" stroke="#1E3A8A" stroke-width="3.5"/>
            <circle cx="100" cy="100" r="86" fill="none" stroke="#1E3A8A" stroke-width="1.2" opacity="0.6"/>
            <path id="tA" d="M 20,100 A 80,80 0 0,1 180,100" fill="none"/>
            <text font-family="Arial,sans-serif" font-size="11.5" font-weight="700" fill="#1E3A8A" letter-spacing="2.5">
              <textPath href="#tA" startOffset="5%">{{ strtoupper($config->nom_entreprise ?? 'DAR-SOINS') }}</textPath>
            </text>
            <path id="tB" d="M 24,112 A 80,80 0 0,0 176,112" fill="none"/>
            <text font-family="Arial,sans-serif" font-size="9.5" font-weight="700" fill="#1E3A8A" letter-spacing="1.5" opacity="0.8">
              <textPath href="#tB" startOffset="8%">{{ $config->ice ?? '' }} · {{ $config->ville ?? 'CASABLANCA' }}</textPath>
            </text>
            <line x1="100" y1="18" x2="100" y2="27" stroke="#1E3A8A" stroke-width="2" opacity="0.7"/>
            <line x1="100" y1="173" x2="100" y2="182" stroke="#1E3A8A" stroke-width="2" opacity="0.7"/>
            <rect x="89" y="76" width="22" height="7" rx="3.5" fill="#0D9488"/>
            <rect x="96" y="69" width="7" height="22" rx="3.5" fill="#0D9488"/>
            <path d="M100 100 A9 9 0 1 0 100 118 A6 6 0 1 1 100 100Z" fill="#1E3A8A" opacity="0.65"/>
            <text x="100" y="146" text-anchor="middle" font-family="Georgia,serif" font-size="13.5" font-weight="700" fill="#1E3A8A" letter-spacing="0.5">Dar-Soins</text>
            <text x="100" y="161" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#0D9488" letter-spacing="3">APPROUVÉ</text>
            <circle cx="100" cy="100" r="94" fill="none" stroke="#1E3A8A" stroke-width="0.4" stroke-dasharray="2,5" opacity="0.25"/>
          </svg>
          <div style="font-size:10px;color:#94A3B8;margin-top:4px;">{{ $facture->created_at->format('d/m/Y') }}</div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ MENTIONS LÉGALES ══ --}}
  <div class="legal">
    @if($config->mentions_facture)
      {{ $config->mentions_facture }}<br>
    @else
      <strong>Conditions de reglement :</strong> Paiement exigible a la fin de l'intervention. Tout retard entraine des penalites de 1,5% par mois.<br>
    @endif
    {{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}
    @if($config->rc) — RC {{ $config->rc }} @endif
    @if($config->if_fiscal) — IF {{ $config->if_fiscal }} @endif
    @if($config->ice) — ICE {{ $config->ice }} @endif
    @if($config->patente) — Patente {{ $config->patente }} @endif<br>
    @if($config->adresse) {{ $config->adresse }}, @endif
    {{ $config->ville ?? '' }} {{ $config->code_postal ?? '' }}
    @if($config->site_web) — <strong>{{ $config->site_web }}</strong> @endif
    @if($config->pied_facture)<br>{{ $config->pied_facture }}@endif
  </div>

</div>
<div class="bottom-bar"></div>

</body>
</html>
