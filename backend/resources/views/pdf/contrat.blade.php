<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Contrat {{ $contrat->reference }}</title>
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
    font-size: 10.5px;
    line-height: 1.4;
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
    margin-bottom: 10px;
  }
  .header-table td {
    vertical-align: middle;
  }

  .meta-table {
    width: 280px;
    margin-left: auto;
    border-collapse: collapse;
    font-size: 10.5px;
  }
  .meta-table td {
    padding: 2px 0;
  }
  .meta-table td.lbl {
    color: #64748B;
    font-weight: bold;
    width: 48%;
  }
  .meta-table td.val {
    text-align: right;
    font-weight: bold;
    color: #1E293B;
  }

  .banner-doc {
    text-align: center;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: bold;
    color: #0F172A;
    border-radius: 4px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── Blocs parties côte à côte ── */
  .parties-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
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
    line-height: 1.45;
    background: #F8FAFC;
    color: #334155;
    font-size: 10px;
  }

  /* ── Tableau des spécificités ── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
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

  .items-table tbody tr {
    border-bottom: 1px solid #E2E8F0;
  }
  .items-table tbody tr:nth-child(even) {
    background: #F8FAFC;
  }
  
  .items-table td {
    padding: 6px 10px;
    vertical-align: middle;
    font-size: 10px;
  }
  
  .items-table td.r { text-align: right; }

  .section-label {
    font-size: 10px;
    font-weight: bold;
    color: #0F172A;
    text-transform: uppercase;
    margin: 8px 0 4px 0;
  }

  .clause-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 9px;
    color: #334155;
    line-height: 1.4;
    margin-bottom: 10px;
    white-space: pre-wrap;
  }

  .medical-box {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #991B1B;
  }

  .totals-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
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

  /* ── Signatures & Cachet ── */
  .signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    margin-bottom: 10px;
    page-break-inside: avoid;
  }
  
  .signatures-table td {
    width: 50%;
    vertical-align: top;
  }
  
  .sig-box {
    border: 1px dashed #CBD5E1;
    border-radius: 6px;
    padding: 8px 10px;
    min-height: 80px;
    background: #FAFAFA;
  }
  
  .sig-label {
    font-size: 9px;
    font-weight: bold;
    text-transform: uppercase;
    color: #0F172A;
    margin-bottom: 3px;
  }
  
  .sig-text {
    font-size: 8.5px;
    color: #64748B;
    font-style: italic;
  }

  /* ── Mentions Légales & Footer ── */
  .legal {
    padding-top: 6px;
    border-top: 1px solid #E2E8F0;
    font-size: 8.5px;
    color: #64748B;
    line-height: 1.45;
    text-align: center;
  }
  .legal strong {
    color: #475569;
  }

  .bottom-bar {
    background: linear-gradient(to right, #10B981 0%, #2563EB 100%);
    height: 4px;
    width: 100%;
    margin-top: 10px;
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
        <img src="{{ public_path('images/logo.png') }}" style="width: 120px; height: 120px;" alt="Dar-Soins Logo">
      </td>
      <td style="width: 50%; text-align: right; vertical-align: top;">
        <div style="font-size: 20px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">CONTRAT DE SERVICE</div>
        <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; color: #1E293B;">
          {{ $contrat->reference }}
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ METADONNEES ══ --}}
  <table class="header-table" style="margin-bottom: 6px;">
    <tr>
      <td style="width: 50%; font-size: 9.5px; color: #475569; line-height: 1.45;">
        <strong>{{ $config->nom_entreprise ?? 'Dar Soins Medicaux SARL' }}</strong><br>
        {{ $config->adresse ?? 'Avenue Mohammed V, Quartier Hassan, Rabat' }}{{ $config->ville ? ', ' . $config->ville : '' }}<br>
        @if($config->telephone) ☎ {{ $config->telephone }} @else ☎ 05 37 00 00 00 @endif
        @if($config->email_contact) &nbsp;|&nbsp; ✉ {{ $config->email_contact }} @else &nbsp;|&nbsp; ✉ contact@dar-soins.com @endif
      </td>
      <td style="width: 50%; vertical-align: bottom;">
        <table class="meta-table">
          <tr>
            <td class="lbl">Date d'effet :</td>
            <td class="val">{{ \Carbon\Carbon::parse($contrat->date_debut)->format('d/m/Y') }}</td>
          </tr>
          <tr>
            <td class="lbl">Échéance :</td>
            <td class="val">{{ \Carbon\Carbon::parse($contrat->date_fin)->format('d/m/Y') }}</td>
          </tr>
          <tr>
            <td class="lbl">Statut :</td>
            <td class="val" style="color: #15803D; text-transform: uppercase;">{{ $contrat->statut }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div class="banner-doc">
    CONTRAT DE PRESTATION DE SERVICE DE GARDE INFIRMIÈRE À DOMICILE
  </div>

  {{-- ══ PARTIES COTE A COTE ══ --}}
  @php
    $clientName = $contrat->client?->user ? trim(($contrat->client->user->prenom ?? '') . ' ' . ($contrat->client->user->nom ?? $contrat->client->user->name)) : 'Client #' . $contrat->client_id;
    $infName = $contrat->infirmier?->user ? trim(($contrat->infirmier->user->prenom ?? '') . ' ' . ($contrat->infirmier->user->nom ?? $contrat->infirmier->user->name)) : 'Infirmier de garde désigné';
  @endphp
  <table class="parties-table">
    <tr>
      <td style="padding-right: 6px;">
        <div class="party-box">
          <div class="party-title">1. Le Patient / Représentant Légal</div>
          <div class="party-details">
            <strong style="color: #000; font-size: 11px;">{{ $clientName }}</strong><br>
            <strong>Téléphone :</strong> {{ $contrat->client?->telephone ?? ($contrat->client?->user?->telephone ?? 'Non renseigné') }}<br>
            <strong>Email :</strong> {{ $contrat->client?->user?->email ?? 'Non renseigné' }}<br>
            <strong>Adresse :</strong> {{ $contrat->client?->adresse ?? 'Non renseignée' }}
          </div>
        </div>
      </td>
      <td style="padding-left: 6px;">
        <div class="party-box">
          <div class="party-title">2. L'Infirmier(ère) Affecté(e)</div>
          <div class="party-details">
            <strong style="color: #000; font-size: 11px;">{{ $infName }}</strong><br>
            <strong>Spécialité :</strong> {{ $contrat->infirmier?->specialite ?? 'Soins infirmiers à domicile' }}<br>
            <strong>Coordination :</strong> DAR-SOINS Pôle Médical<br>
            <strong>Astreinte d'urgence :</strong> 05 37 00 00 00
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ TABLEAU DES PRESTATIONS ══ --}}
  @php
    $d1 = \Carbon\Carbon::parse($contrat->date_debut);
    $d2 = \Carbon\Carbon::parse($contrat->date_fin);
    $nbJours = max(1, $d1->diffInDays($d2) + 1);
  @endphp
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 45%;">Désignation de la Prestation de Garde</th>
        <th style="width: 20%;">Horaires Convenus</th>
        <th class="r" style="width: 15%;">Tarif / Jour</th>
        <th class="r" style="width: 20%;">Montant Total HT</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong style="color: #0F172A; font-size: 10.5px;">Garde Médicale — {{ strtoupper(str_replace('_', ' ', $contrat->type_garde)) }}</strong><br>
          <span style="font-size: 9px; color: #64748B;">Période du {{ $d1->format('d/m/Y') }} au {{ $d2->format('d/m/Y') }} ({{ $nbJours }} jour(s))</span>
        </td>
        <td>{{ $contrat->horaires_garde ?? 'Selon planning médical établi' }}</td>
        <td class="r">{{ number_format($contrat->tarif_journalier, 2, ',', ' ') }} MAD</td>
        <td class="r"><strong>{{ number_format($contrat->montant_total, 2, ',', ' ') }} MAD</strong></td>
      </tr>
    </tbody>
  </table>

  {{-- ══ PROTOCOLES ET CLAUSES ══ --}}
  @if($contrat->prescriptions_medicales)
    <div class="section-label" style="color: #991B1B;">Protocole Médical & Prescriptions à Domicile</div>
    <div class="clause-box medical-box">{{ $contrat->prescriptions_medicales }}</div>
  @endif

  <div class="section-label">Clauses Juridiques & Engagements Spécifiques</div>
  <div class="clause-box">{{ $contrat->clauses_specifiques ?? 'Les parties s\'engagent au respect des protocoles de soins et de la déontologie médicale.' }}</div>

  {{-- ══ TOTAUX ══ --}}
  <table class="totals-table">
    <tr>
      <td class="lbl" style="width: 70%;">Sous-total Prestation de Garde ({{ $nbJours }} jours)</td>
      <td class="val">{{ number_format($contrat->montant_total, 2, ',', ' ') }} MAD</td>
    </tr>
    <tr class="grand-total">
      <td class="lbl">MONTANT TOTAL DU CONTRAT CONVENU</td>
      <td class="val">{{ number_format($contrat->montant_total, 2, ',', ' ') }} MAD</td>
    </tr>
  </table>

  {{-- ══ SIGNATURES & CACHET ══ --}}
  <table class="signatures-table">
    <tr>
      <td style="padding-right: 6px;">
        <div class="sig-box">
          <div class="sig-label">Le Client / Bénéficiaire</div>
          <div class="sig-text">"Lu et Approuvé, Bon pour Accord"</div>
          <div style="height: 55px;"></div>
        </div>
      </td>
      <td style="padding-left: 6px;">
        <div class="sig-box">
          <div class="sig-label">Pour la Direction DAR-SOINS</div>
          <div class="sig-text">Signature & Cachet de l'Établissement</div>
          <div style="text-align: center; margin-top: 4px;">
            <img src="{{ public_path('images/cachet.jpg') }}" style="max-height: 55px; max-width: 130px; display: inline-block;" alt="Cachet Dar-Soins">
          </div>
        </div>
      </td>
    </tr>
  </table>

  {{-- ══ MENTIONS LEGALES ══ --}}
  <div class="legal">
    <strong>DAR-SOINS SOINS MÉDICAUX SARL</strong>
    @if($config?->rc) — RC {{ $config->rc }} @else — RC 148529 @endif
    @if($config?->if_fiscal) — IF {{ $config->if_fiscal }} @else — IF 45892154 @endif
    @if($config?->ice) — ICE {{ $config->ice }} @else — ICE 002589632000045 @endif
    @if($config?->patente) — Patente {{ $config->patente }} @else — Patente 35896412 @endif<br>
    {{ $config?->adresse ?? 'Avenue Mohammed V, Quartier Hassan, Rabat' }}
    — <strong>www.dar-soins.com</strong>
  </div>

</div>

<div class="bottom-bar"></div>

</body>
</html>
