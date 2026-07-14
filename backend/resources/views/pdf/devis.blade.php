<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis {{ $devis->id }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
    color: #1E293B;
    font-size: 13px;
    line-height: 1.55;
    background: #fff;
  }

  .top-bar {
    background: linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%);
    height: 8px;
  }

  .page { padding: 32px 40px 28px; }

  /* ── En-tête ── */
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  .header-table td { vertical-align: top; }

  .logo-name { font-size: 28px; font-weight: 700; color: #1E293B; letter-spacing: -0.5px; line-height: 1; }
  .logo-name span { color: #0D9488; }
  .logo-tagline { font-size: 9.5px; color: #64748B; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 3px; }
  .logo-divider { width: 160px; height: 1.5px; background: #0D9488; margin-top: 5px; opacity: 0.5; }

  .company-address { margin-top: 14px; font-size: 11.5px; color: #475569; line-height: 1.7; }
  .company-address strong { color: #1E293B; font-size: 12px; }

  .devis-meta { width: 45%; text-align: right; }
  .devis-badge {
    display: inline-block;
    background: linear-gradient(135deg, #0D9488, #1E3A8A);
    color: white;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 4px;
    padding: 8px 22px;
    border-radius: 6px;
    margin-bottom: 14px;
  }
  .devis-num { font-size: 13px; color: #64748B; margin-bottom: 10px; }
  .devis-num strong { color: #1E293B; }
  .devis-dates { font-size: 12px; color: #475569; line-height: 1.8; }
  .devis-dates strong { color: #1E293B; }

  /* ── Bandeau estimatif ── */
  .estimate-banner {
    background: #FFF7ED;
    border: 1px solid #FED7AA;
    border-left: 4px solid #F97316;
    border-radius: 6px;
    padding: 10px 16px;
    margin-bottom: 24px;
    font-size: 11.5px;
    color: #9A3412;
  }
  .estimate-banner strong { color: #7C2D12; }

  .divider { height: 1px; background: linear-gradient(to right, #1E3A8A22, #0D948844, #1E3A8A22); margin: 0 0 24px; }

  /* ── Bloc client ── */
  .client-box {
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 14px 16px;
    background: #F8FAFC;
    position: relative;
    overflow: hidden;
    margin-bottom: 24px;
    width: 48%;
    display: inline-block;
  }
  .client-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
    background: linear-gradient(to bottom, #1E3A8A, #0D9488);
    border-radius: 8px 0 0 8px;
  }
  .party-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0D9488; margin-bottom: 6px; }
  .party-name { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 3px; }
  .party-detail { font-size: 11.5px; color: #475569; line-height: 1.7; }

  /* ── Tableau ── */
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table thead tr { background: #0F172A; color: white; }
  .items-table th { padding: 11px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-align: left; }
  .items-table th.r { text-align: right; }
  .items-table tbody tr { border-bottom: 1px solid #E2E8F0; }
  .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
  .items-table td { padding: 11px 14px; vertical-align: middle; }
  .items-table td.r { text-align: right; }

  .item-main { font-weight: 600; color: #1E293B; font-size: 13px; }
  .item-sub { font-size: 11px; color: #64748B; margin-top: 2px; }

  .badge-soin { display: inline-block; background: #DBEAFE; color: #1E40AF; font-size: 9px; font-weight: 700; letter-spacing: 1px; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; margin-bottom: 3px; }
  .badge-deplacement { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 9px; font-weight: 700; letter-spacing: 1px; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; margin-bottom: 3px; }

  /* ── Totaux ── */
  .totals-wrapper { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .totals-wrapper td:first-child { width: 55%; vertical-align: top; }
  .totals-wrapper td:last-child { width: 45%; vertical-align: top; }

  .validity-box {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 12px;
    color: #1E40AF;
  }
  .validity-box strong { display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #1D4ED8; margin-bottom: 6px; }

  .totals-box { border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
  .totals-line td { padding: 9px 16px; font-size: 12.5px; border-bottom: 1px solid #E2E8F0; }
  .totals-line td.lbl { color: #475569; font-weight: 600; }
  .totals-line td.val { text-align: right; color: #1E293B; font-weight: 600; }
  .totals-line.tva td { background: #F8FAFC; }
  .totals-line.grand-total td {
    background: linear-gradient(135deg, #0D9488, #1E3A8A);
    color: white !important;
    font-size: 15px;
    font-weight: 700;
    padding: 12px 16px;
  }
  .totals-line.grand-total td.lbl { color: white; }
  .totals-line.grand-total td.val { color: white; }

  /* ── Pied ── */
  .footer-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .footer-table td { width: 50%; vertical-align: top; text-align: center; }

  .accept-box {
    border: 1px dashed #CBD5E1;
    border-radius: 8px;
    padding: 16px;
    min-height: 110px;
    background: #FAFAFA;
    text-align: left;
  }
  .accept-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; margin-bottom: 8px; }
  .accept-line { border-bottom: 1px solid #E2E8F0; margin: 8px 0; }
  .accept-text { font-size: 11px; color: #94A3B8; }

  .cachet-box { padding: 8px; }
  .cachet-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; margin-bottom: 8px; }

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

  .bottom-bar {
    background: linear-gradient(135deg, #0D9488 0%, #1E3A8A 100%);
    height: 5px;
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
      <td style="width:55%;">
        <table style="border:none;padding:0;margin:0;">
          <tr>
            <td style="vertical-align:middle;padding:0;border:none;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="62" height="62">
                <defs>
                  <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1E3A8A"/>
                    <stop offset="100%" style="stop-color:#0D9488"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="68" height="68" rx="14" fill="url(#lg2)"/>
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
      <td class="devis-meta">
        <div class="devis-badge">DEVIS</div>
        <div class="devis-num">
          N° : <strong>DEV-{{ str_pad($devis->id, 5, '0', STR_PAD_LEFT) }}</strong>
        </div>
        <div class="devis-dates">
          <strong>Date d'émission :</strong> {{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}<br>
          <strong>Intervention prévue :</strong> {{ \Carbon\Carbon::parse($intervention->date_heure)->format('d/m/Y à H:i') }}<br>
          <strong>Validite :</strong> {{ $config->delai_validite_devis_j ?? 30 }} jours
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ BANDEAU ESTIMATIF ══ --}}
  <div class="estimate-banner">
    <strong>⚠ Devis estimatif — Non contractuel</strong>
    Ce document est une estimation basée sur les informations fournies. Le montant final pourra varier selon les consommables utilisés lors de l'intervention.
  </div>

  <div class="divider"></div>

  {{-- ══ CLIENT ══ --}}
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr>
      <td style="width:50%;padding-right:12px;">
        <div class="client-box" style="width:100%;display:block;">
          <div class="party-label">Établi pour</div>
          <div class="party-name">{{ $intervention->client->user->name }}</div>
          <div class="party-detail">
            {{ $intervention->client->user->email }}<br>
            @if($intervention->localisation)
              {{ $intervention->localisation->adresse ?? '' }}
            @endif
          </div>
        </div>
      </td>
      <td style="width:50%;padding-left:12px;">
        <div class="client-box" style="width:100%;display:block;">
          <div class="party-label">Prestation demandée</div>
          <div class="party-name">{{ $intervention->produit->nom }}</div>
          <div class="party-detail">
            Type : {{ ucfirst(str_replace('_', ' ', $intervention->type)) }}<br>
            @if($intervention->description_probleme)
              {{ Str::limit($intervention->description_probleme, 80) }}
            @endif
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ TABLEAU ══ --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:55%;">Description</th>
        <th class="r" style="width:22%;">Prix unitaire</th>
        <th class="r" style="width:23%;">Montant estimé</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <span class="badge-soin">Prestation médicale</span><br>
          <span class="item-main">{{ $intervention->produit->nom }}</span>
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            <div class="item-sub">Garde malade — {{ $intervention->duree_heures }}h × {{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} MAD/h</div>
          @else
            <div class="item-sub">Soin infirmier à domicile — forfait</div>
          @endif
        </td>
        <td class="r">{{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} MAD</td>
        <td class="r">
          @if($intervention->type === 'garde_malade' && $intervention->duree_heures)
            {{ number_format($intervention->produit->prix_client * $intervention->duree_heures, 2, ',', ' ') }} MAD
          @else
            {{ number_format($intervention->produit->prix_client, 2, ',', ' ') }} MAD
          @endif
        </td>
      </tr>
      @if($devis->frais_deplacement > 0)
      <tr>
        <td>
          <span class="badge-deplacement">Déplacement</span><br>
          <span class="item-main">Frais kilométriques</span>
          <div class="item-sub">Basé sur la distance estimée jusqu'au domicile</div>
        </td>
        <td class="r">—</td>
        <td class="r">{{ number_format($devis->frais_deplacement, 2, ',', ' ') }} MAD</td>
      </tr>
      @endif
      <tr style="background:#FFF7ED;">
        <td colspan="2" style="font-size:11px;color:#92400E;font-style:italic;padding:10px 14px;">
          * Consommables médicaux éventuels non inclus — seront facturés après intervention
        </td>
        <td class="r" style="color:#92400E;font-style:italic;">Variable</td>
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
      <td style="padding-right:16px;">
        <div class="validity-box">
          <strong>Conditions d'acceptation</strong>
          Ce devis est valable <strong>{{ $config->delai_validite_devis_j ?? 30 }} jours</strong> a compter de sa date d'emission.<br><br>
          Pour accepter, veuillez signer et retourner ce document ou confirmer via l'application Dar-Soins.<br><br>
          <strong>Contact :</strong> {{ $config->telephone ?? '+212 522 123 456' }}<br>
          <strong>Email :</strong> {{ $config->email_contact ?? 'contact@darsoins.ma' }}
        </div>
      </td>
      <td>
        <table class="totals-box" style="width:100%;border-collapse:collapse;">
          <tr class="totals-line">
            <td class="lbl">Sous-total HT</td>
            <td class="val">{{ number_format($montantHT, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr class="totals-line tva">
            <td class="lbl">TVA ({{ $tva }}%)</td>
            <td class="val">{{ number_format($montantTTC - $montantHT, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr class="totals-line grand-total">
            <td class="lbl">TOTAL ESTIME TTC</td>
            <td class="val">{{ number_format($montantTTC, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- ══ ACCEPTATION + CACHET ══ --}}
  <table class="footer-table">
    <tr>
      <td style="padding-right:16px;">
        <div class="accept-box">
          <div class="accept-label">Bon pour accord — Signature du client</div>
          <div class="accept-text">Lu et approuvé — Devis accepté le :</div>
          <div class="accept-line"></div>
          <div style="height:40px;"></div>
          <div class="accept-line"></div>
          <div class="accept-text" style="margin-top:4px;">Signature :</div>
        </div>
      </td>
      <td style="padding-left:16px;">
        <div class="cachet-box">
          <div class="cachet-label">Cachet &amp; Signature Dar-Soins</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="130" height="130" style="opacity:0.88;">
            <circle cx="100" cy="100" r="94" fill="none" stroke="#1E3A8A" stroke-width="3.5"/>
            <circle cx="100" cy="100" r="86" fill="none" stroke="#1E3A8A" stroke-width="1.2" opacity="0.6"/>
            <path id="tC" d="M 20,100 A 80,80 0 0,1 180,100" fill="none"/>
            <text font-family="Arial,sans-serif" font-size="11.5" font-weight="700" fill="#1E3A8A" letter-spacing="2.5">
              <textPath href="#tC" startOffset="5%">DAR-SOINS MAROC · SOINS À DOMICILE</textPath>
            </text>
            <path id="tD" d="M 24,112 A 80,80 0 0,0 176,112" fill="none"/>
            <text font-family="Arial,sans-serif" font-size="9.5" font-weight="700" fill="#1E3A8A" letter-spacing="1.5" opacity="0.8">
              <textPath href="#tD" startOffset="8%">ICE : 002847561000083 · CASABLANCA</textPath>
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
          <div style="font-size:10px;color:#94A3B8;margin-top:4px;">{{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}</div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ MENTIONS ══ --}}
  <div class="legal">
    <strong>Document non contractuel — Estimation soumise a validation.</strong>
    Ce devis est etabli conformement aux tarifs en vigueur au {{ \Carbon\Carbon::parse($devis->date)->format('d/m/Y') }}.<br>
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
