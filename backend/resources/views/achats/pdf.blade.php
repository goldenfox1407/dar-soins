<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Achat {{ $achat->reference }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif; color: #1E293B; font-size: 13px; line-height: 1.55; background: #fff; }
  .top-bar { background: linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%); height: 8px; width: 100%; }
  .page { padding: 32px 40px 28px; }
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .header-table td { vertical-align: top; }
  .logo-name { font-size: 28px; font-weight: 700; color: #1E293B; letter-spacing: -0.5px; line-height: 1; }
  .logo-name span { color: #0D9488; }
  .logo-tagline { font-size: 9.5px; color: #64748B; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 3px; }
  .logo-divider { width: 160px; height: 1.5px; background: #0D9488; margin-top: 5px; opacity: 0.5; }
  .company-address { margin-top: 14px; font-size: 11.5px; color: #475569; line-height: 1.7; }
  .company-address strong { color: #1E293B; font-size: 12px; }
  .doc-meta { width: 45%; text-align: right; }
  .doc-badge { display: inline-block; background: linear-gradient(135deg, #1E3A8A, #0D9488); color: white; font-size: 22px; font-weight: 700; letter-spacing: 4px; padding: 8px 22px; border-radius: 6px; margin-bottom: 14px; }
  .doc-ref { font-size: 13px; color: #64748B; margin-bottom: 10px; }
  .doc-ref strong { color: #1E293B; }
  .doc-dates { font-size: 12px; color: #475569; line-height: 1.8; }
  .doc-dates strong { color: #1E293B; }
  .divider { height: 1px; background: linear-gradient(to right, #1E3A8A22, #0D948844, #1E3A8A22); margin: 0 0 24px; }
  .parties-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  .parties-table td { width: 50%; vertical-align: top; }
  .party-box { border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; background: #F8FAFC; position: relative; overflow: hidden; }
  .party-box::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, #1E3A8A, #0D9488); border-radius: 8px 0 0 8px; }
  .party-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0D9488; margin-bottom: 6px; }
  .party-name { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 3px; }
  .party-detail { font-size: 11.5px; color: #475569; line-height: 1.7; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table thead tr { background: #0F172A; color: white; }
  .items-table th { padding: 11px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-align: left; }
  .items-table th.r { text-align: right; }
  .items-table th.c { text-align: center; }
  .items-table tbody tr { border-bottom: 1px solid #E2E8F0; }
  .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
  .items-table td { padding: 11px 14px; vertical-align: middle; }
  .items-table td.r { text-align: right; }
  .items-table td.c { text-align: center; }
  .badge-statut { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .badge-recu { background: #D1FAE5; color: #065F46; }
  .badge-commande { background: #DBEAFE; color: #1E40AF; }
  .badge-annule { background: #FEE2E2; color: #991B1B; }
  .totals-wrapper { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .totals-wrapper td:first-child { width: 55%; vertical-align: top; }
  .totals-wrapper td:last-child { width: 45%; vertical-align: top; }
  .info-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #166534; }
  .info-box strong { display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #15803D; margin-bottom: 6px; }
  .totals-box { border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
  .totals-line td { padding: 9px 16px; font-size: 12.5px; border-bottom: 1px solid #E2E8F0; }
  .totals-line td.lbl { color: #475569; font-weight: 600; }
  .totals-line td.val { text-align: right; color: #1E293B; font-weight: 600; }
  .totals-line.grand-total td { background: linear-gradient(135deg, #1E3A8A, #0D9488); color: white !important; font-size: 15px; font-weight: 700; padding: 12px 16px; }
  .legal { margin-top: 28px; padding-top: 14px; border-top: 1px solid #E2E8F0; font-size: 10.5px; color: #94A3B8; line-height: 1.7; text-align: center; }
  .legal strong { color: #64748B; }
  .bottom-bar { background: linear-gradient(135deg, #0D9488 0%, #1E3A8A 100%); height: 5px; width: 100%; margin-top: 20px; }
</style>
</head>
<body>

<div class="top-bar"></div>
<div class="page">

  {{-- EN-TETE --}}
  <table class="header-table">
    <tr>
      <td style="width:55%;">
        <table style="border:none;padding:0;margin:0;">
          <tr>
            <td style="vertical-align:middle;padding:0;border:none;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="62" height="62">
                <defs>
                  <linearGradient id="lgA" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1E3A8A"/>
                    <stop offset="100%" style="stop-color:#0D9488"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="68" height="68" rx="14" fill="url(#lgA)"/>
                <path d="M32 16 A18 18 0 1 0 32 56 A12 12 0 1 1 32 16Z" fill="white" opacity="0.93"/>
                <rect x="40" y="28" width="20" height="7" rx="3.5" fill="#10B981"/>
                <rect x="47" y="21" width="7" height="21" rx="3.5" fill="#10B981"/>
              </svg>
            </td>
            <td style="vertical-align:middle;padding-left:12px;border:none;">
              <div class="logo-name">Dar<span>-Soins</span></div>
              <div class="logo-tagline">Soins Infirmiers a Domicile</div>
              <div class="logo-divider"></div>
            </td>
          </tr>
        </table>
        @php $config = $config ?? null; @endphp
        <div class="company-address">
          <strong>{{ $config?->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong><br>
          {{ $config?->adresse ?? '' }}{{ $config?->ville ? ', ' . $config->ville : '' }}<br>
          {{ $config?->code_postal ?? '' }} {{ $config?->pays ?? 'Maroc' }}<br>
          @if($config?->telephone) &#9742; {{ $config->telephone }} &nbsp;|&nbsp; @endif
          @if($config?->email_contact) &#9993; {{ $config->email_contact }} @endif<br>
          @if($config?->rc) RC : {{ $config->rc }} @endif
          @if($config?->ice) &nbsp;|&nbsp; ICE : {{ $config->ice }} @endif
        </div>
      </td>
      <td class="doc-meta">
        <div class="doc-badge">BON D'ACHAT</div>
        <div class="doc-ref">
          Reference : <strong>{{ $achat->reference }}</strong>
        </div>
        <div class="doc-dates">
          <strong>Date :</strong> {{ $achat->created_at->format('d/m/Y') }}<br>
          <strong>Statut :</strong> {{ ucfirst($achat->statut) }}<br>
          <strong>Paiement :</strong> {{ ucfirst($achat->statut_paiement) }}
        </div>
      </td>
    </tr>
  </table>

  <div class="divider"></div>

  {{-- PARTIES --}}
  <table class="parties-table">
    <tr>
      <td style="padding-right:12px;">
        <div class="party-box">
          <div class="party-label">Fournisseur</div>
          <div class="party-name">{{ $achat->fournisseur->nom ?? 'N/A' }}</div>
          <div class="party-detail">
            {{ $achat->fournisseur->email ?? '' }}<br>
            {{ $achat->fournisseur->telephone ?? '' }}
          </div>
        </div>
      </td>
      <td style="padding-left:12px;">
        <div class="party-box">
          <div class="party-label">Entrepot de reception</div>
          <div class="party-name">{{ $achat->entrepot->nom ?? 'N/A' }}</div>
          <div class="party-detail">
            {{ $achat->entrepot->localisation ?? '' }}
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- TABLEAU DES LIGNES --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:46%;">Produit</th>
        <th class="c" style="width:12%;">Qte</th>
        <th class="r" style="width:21%;">Prix unitaire</th>
        <th class="r" style="width:21%;">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($achat->lignes as $ligne)
      <tr>
        <td>
          <span style="font-weight:600;color:#1E293B;">{{ $ligne->produit->nom ?? 'Produit inconnu' }}</span>
          @if($ligne->produit?->reference)
          <div style="font-size:11px;color:#64748B;">Ref: {{ $ligne->produit->reference }}</div>
          @endif
        </td>
        <td class="c">{{ $ligne->quantite }}</td>
        <td class="r">{{ number_format($ligne->cout_unitaire, 2, ',', ' ') }} {{ $config?->devise_defaut ?? 'MAD' }}</td>
        <td class="r">{{ number_format($ligne->sous_total, 2, ',', ' ') }} {{ $config?->devise_defaut ?? 'MAD' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  {{-- TOTAUX --}}
  @php
    $devise = $config?->devise_defaut ?? 'MAD';
    $tva = (float)($config?->tva ?? 20);
    $total = (float)$achat->montant_total;
    $ht = $total / (1 + $tva / 100);
    $tvaAmt = $total - $ht;
  @endphp
  <table class="totals-wrapper">
    <tr>
      <td style="padding-right:16px;">
        <div class="info-box">
          <strong>Informations du bon</strong>
          Statut : {{ ucfirst($achat->statut) }}<br>
          Paiement : {{ ucfirst($achat->statut_paiement) }}<br>
          @if($achat->notes)
          <br>Notes : {{ $achat->notes }}
          @endif
        </div>
      </td>
      <td>
        <table class="totals-box" style="width:100%;border-collapse:collapse;">
          <tr class="totals-line">
            <td class="lbl">Sous-total HT</td>
            <td class="val">{{ number_format($ht, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr class="totals-line">
            <td class="lbl">TVA ({{ $tva }}%)</td>
            <td class="val">{{ number_format($tvaAmt, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
          <tr class="totals-line grand-total">
            <td class="lbl" style="color:white;">TOTAL TTC</td>
            <td class="val" style="color:white;">{{ number_format($total, 2, ',', ' ') }} {{ $devise }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- MENTIONS --}}
  <div class="legal">
    {{ $config?->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}
    @if($config?->rc) &mdash; RC {{ $config->rc }} @endif
    @if($config?->ice) &mdash; ICE {{ $config->ice }} @endif<br>
    @if($config?->adresse) {{ $config->adresse }}, @endif
    {{ $config?->ville ?? '' }} {{ $config?->code_postal ?? '' }}
    @if($config?->site_web) &mdash; <strong>{{ $config->site_web }}</strong> @endif
  </div>

</div>
<div class="bottom-bar"></div>

</body>
</html>
