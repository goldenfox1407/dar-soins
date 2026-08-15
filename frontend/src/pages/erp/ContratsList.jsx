import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Eye, Trash2, X, CheckCircle, Clock, AlertTriangle, ShieldCheck, Printer, Calendar, User, HeartPulse, FileDown, Download } from 'lucide-react';
import api from '../../services/api';
import contractAssets from '../../assets/contract_assets.json';

export default function ContratsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/contrats');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching contrats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatut) => {
    try {
      await api.patch(`/contrats/${id}/statut`, { statut: newStatut });
      fetchData();
      if (selectedContrat && selectedContrat.id === id) {
        setSelectedContrat({ ...selectedContrat, statut: newStatut });
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut du contrat.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat de garde ?')) {
      try {
        await api.delete(`/contrats/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleShowDetails = (contrat) => {
    setSelectedContrat(contrat);
    setIsModalOpen(true);
  };

  // Direct backend PDF Download
  const handleDownloadPdf = async (id, reference) => {
    try {
      const response = await api.get(`/contrats/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat_${reference || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.warn("Backend PDF download failed, falling back to browser print engine:", err);
      const c = data.find(item => item.id === id);
      if (c) handleGeneratePdf(c);
    }
  };

  // Dedicated PDF Generation & Print Function matching Devis & Facture style
  const handleGeneratePdf = (contrat) => {
    if (!contrat) return;

    const clientName = contrat.client?.user 
      ? `${contrat.client.user.prenom || ''} ${contrat.client.user.nom || contrat.client.user.name || ''}`.trim() 
      : (contrat.client?.nom || `Client #${contrat.client_id}`);
    
    const clientTel = contrat.client?.telephone || contrat.client?.user?.telephone || 'Non renseigné';
    const clientEmail = contrat.client?.user?.email || 'Non renseigné';
    const clientAddr = contrat.client?.adresse || 'Adresse non renseignée';

    const infName = contrat.infirmier?.user 
      ? `${contrat.infirmier.user.prenom || ''} ${contrat.infirmier.user.nom || contrat.infirmier.user.name || ''}`.trim() 
      : (contrat.infirmier?.nom || 'Infirmier de garde désigné');
    const infSpec = contrat.infirmier?.specialite || 'Soins infirmiers à domicile';
    const infTel = contrat.infirmier?.telephone || contrat.infirmier?.user?.telephone || '05 37 00 00 00';

    let typeGardeLabel = 'GARDE DE NUIT (20H - 08H)';
    if (contrat.type_garde === 'jour') typeGardeLabel = 'GARDE DE JOUR (08H - 20H)';
    if (contrat.type_garde === '24h') typeGardeLabel = 'GARDE CONTINUE 24H/24 (RELÈVE D\'ÉQUIPE)';
    if (contrat.type_garde === 'post_operatoire') typeGardeLabel = 'SOINS POST-OPÉRATOIRES INTENSIFS';
    if (contrat.type_garde === 'accompagnement_senior') typeGardeLabel = 'ACCOMPAGNEMENT SENIOR DÉPENDANCE';

    const d1 = new Date(contrat.date_debut);
    const d2 = new Date(contrat.date_fin);
    const diffTime = Math.abs(d2 - d1);
    const nbJours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const logoSrc = contractAssets.logo || '/images/logo.png';
    const cachetSrc = contractAssets.cachet || '/images/cachet.jpg';

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      alert("Veuillez autoriser les popups pour ouvrir le contrat PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Contrat ${contrat.reference}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100%;
            background: #ffffff;
            color: #1E293B;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-wrapper {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          .no-print-bar {
            background: #0f172a;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .btn-print {
            background: #2563EB;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
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
            width: 270px;
            margin-left: auto;
            border-collapse: collapse;
            font-size: 10px;
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
          .parties-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 12px;
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
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .party-details {
            padding: 8px 10px;
            line-height: 1.45;
            background: #F8FAFC;
            color: #334155;
            font-size: 9.5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
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
            font-size: 9.5px;
            word-wrap: break-word;
          }
          .items-table td.r { text-align: right; }
          .section-label {
            font-size: 9.5px;
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
            font-size: 8.5pt;
            color: #334155;
            line-height: 1.4;
            margin-bottom: 10px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          .medical-box {
            background: #FEF2F2;
            border-color: #FECACA;
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
            font-size: 10px;
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
            font-size: 11px;
            padding: 7px 12px;
          }
          .signatures-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .sig-box {
            border: 1px dashed #CBD5E1;
            border-radius: 6px;
            padding: 8px 10px;
            height: 75px;
            background: #FAFAFA;
            vertical-align: top;
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
          @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0 !important; background: transparent !important; }
            .a4-wrapper { padding: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="a4-wrapper">
          <div class="no-print-bar">
            <span>Aperçu Officiel — Contrat de Garde ${contrat.reference}</span>
            <div>
              <button class="btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
            </div>
          </div>

          <div class="top-bar"></div>

          <!-- Header Section with Logo & Ref -->
          <table class="header-table">
            <tr>
              <td style="width: 50%;">
                <img src="${logoSrc}" style="width: 110px; height: 110px; object-fit: contain;" alt="Dar-Soins Logo">
              </td>
              <td style="width: 50%; text-align: right; vertical-align: top;">
                <div style="font-size: 19px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">CONTRAT DE SERVICE</div>
                <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; color: #1E293B;">
                  ${contrat.reference}
                </div>
              </td>
            </tr>
          </table>

          <!-- Company Meta & Contract Meta -->
          <table class="header-table" style="margin-bottom: 6px;">
            <tr>
              <td style="width: 50%; font-size: 9.5px; color: #475569; line-height: 1.45;">
                <strong>DAR-SOINS SOINS MÉDICAUX SARL</strong><br>
                Avenue Mohammed V, Quartier Hassan, Rabat<br>
                ☎ 05 37 00 00 00 &nbsp;|&nbsp; ✉ contact@dar-soins.com
              </td>
              <td style="width: 50%; vertical-align: bottom;">
                <table class="meta-table">
                  <tr>
                    <td class="lbl">Date d'effet :</td>
                    <td class="val">${contrat.date_debut}</td>
                  </tr>
                  <tr>
                    <td class="lbl">Échéance :</td>
                    <td class="val">${contrat.date_fin}</td>
                  </tr>
                  <tr>
                    <td class="lbl">Statut :</td>
                    <td class="val" style="color: #15803D; text-transform: uppercase;">${contrat.statut}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div class="banner-doc">
            CONTRAT DE PRESTATION DE SERVICE DE GARDE INFIRMIÈRE À DOMICILE
          </div>

          <!-- Parties Table -->
          <table class="parties-table">
            <tr>
              <td style="width: 48%; vertical-align: top;">
                <div class="party-box">
                  <div class="party-title">1. Le Patient / Représentant Légal</div>
                  <div class="party-details">
                    <strong style="color: #000; font-size: 10.5px;">${clientName}</strong><br>
                    <strong>Téléphone :</strong> ${clientTel}<br>
                    <strong>Email :</strong> ${clientEmail}<br>
                    <strong>Adresse :</strong> ${clientAddr}
                  </div>
                </div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%; vertical-align: top;">
                <div class="party-box">
                  <div class="party-title">2. L'Infirmier(ère) Affecté(e)</div>
                  <div class="party-details">
                    <strong style="color: #000; font-size: 10.5px;">${infName}</strong><br>
                    <strong>Spécialité :</strong> ${infSpec}<br>
                    <strong>Coordination :</strong> DAR-SOINS Pôle Médical<br>
                    <strong>Ligne d'astreinte :</strong> ${infTel}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
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
                  <strong style="color: #0F172A; font-size: 10px;">${typeGardeLabel}</strong><br>
                  <span style="font-size: 8.5px; color: #64748B;">Période du ${contrat.date_debut} au ${contrat.date_fin} (${nbJours} jour(s))</span>
                </td>
                <td>${contrat.horaires_garde || 'Selon planning médical établi'}</td>
                <td class="r">${Number(contrat.tarif_journalier).toFixed(2)} MAD</td>
                <td class="r"><strong>${Number(contrat.montant_total).toFixed(2)} MAD</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Prescriptions Medicales -->
          ${contrat.prescriptions_medicales ? `
            <div class="section-label" style="color: #991B1B;">Protocole Médical & Prescriptions à Domicile</div>
            <div class="clause-box medical-box">${contrat.prescriptions_medicales}</div>
          ` : ''}

          <!-- Legal Clauses -->
          <div class="section-label">Clauses Juridiques & Engagements Spécifiques</div>
          <div class="clause-box">${contrat.clauses_specifiques || 'Les parties s\'engagent au respect des protocoles de soins et de la déontologie médicale.'}</div>

          <!-- Totals Table -->
          <table class="totals-table">
            <tr>
              <td class="lbl" style="width: 70%;">Sous-total Prestation de Garde (${nbJours} jours)</td>
              <td class="val">${Number(contrat.montant_total).toFixed(2)} MAD</td>
            </tr>
            <tr class="grand-total">
              <td class="lbl">MONTANT TOTAL DU CONTRAT CONVENU</td>
              <td class="val">${Number(contrat.montant_total).toFixed(2)} MAD</td>
            </tr>
          </table>

          <!-- Signatures Table with Cachet -->
          <table class="signatures-table">
            <tr>
              <td style="width: 48%;" class="sig-box">
                <div class="sig-label">Le Client / Bénéficiaire</div>
                <div class="sig-text">"Lu et Approuvé, Bon pour Accord"</div>
                <div style="height: 55px;"></div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%;" class="sig-box">
                <div class="sig-label">Pour la Direction DAR-SOINS</div>
                <div class="sig-text">Signature & Cachet de l'Établissement</div>
                <div style="text-align: center; margin-top: 4px;">
                  <img src="${cachetSrc}" style="max-height: 55px; max-width: 130px; display: inline-block;" alt="Cachet Dar-Soins">
                </div>
              </td>
            </tr>
          </table>

          <!-- Legal Mentions -->
          <div class="legal">
            <strong>DAR-SOINS SOINS MÉDICAUX SARL</strong> — RC 148529 — IF 45892154 — ICE 002589632000045 — Patente 35896412<br>
            Avenue Mohammed V, Quartier Hassan, Rabat — <strong>www.dar-soins.com</strong>
          </div>

          <div class="bottom-bar"></div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    pdfWindow.document.open();
    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
  };

  const renderTypeGardeBadge = (type) => {
    switch (type) {
      case 'nuit':
        return (
          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🌙 Garde de Nuit (20h-08h)
          </span>
        );
      case 'jour':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            ☀️ Garde de Jour (08h-20h)
          </span>
        );
      case '24h':
        return (
          <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            ⏳ Garde Continue 24h/24
          </span>
        );
      case 'post_operatoire':
        return (
          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🏥 Soins Post-opératoires
          </span>
        );
      case 'accompagnement_senior':
        return (
          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            👵 Accompagnement Senior
          </span>
        );
      default:
        return type;
    }
  };

  const renderStatusBadge = (statut) => {
    switch (statut) {
      case 'actif':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> En cours (Actif)
          </span>
        );
      case 'en_attente':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> En Attente
          </span>
        );
      case 'termine':
        return (
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Terminé
          </span>
        );
      case 'resilie':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={14} /> Résilié
          </span>
        );
      default:
        return statut;
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const clientName = item.client?.user ? `${item.client.user.prenom || ''} ${item.client.user.nom || ''}` : '';
    const infName = item.infirmier?.user ? `${item.infirmier.user.prenom || ''} ${item.infirmier.user.nom || ''}` : '';
    return (
      item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type_garde?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Contrats de Garde Médicale</h1>
          <p className="erp-page-subtitle">Gérez les contrats de services de garde à domicile et générez les documents officiels avec logo et cachet.</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/contrats/ajouter')} className="erp-btn-primary">
          <Plus size={18} /> Nouveau Contrat de Garde
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, patient, infirmier ou cas de garde..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted">Chargement...</div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Patient / Client</th>
                  <th>Infirmier Affecté</th>
                  <th>Cas de Garde</th>
                  <th>Période</th>
                  <th>Tarif / Jour</th>
                  <th>Montant Total</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-muted">
                      Aucun contrat de garde trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const clientName = item.client?.user ? `${item.client.user.prenom || ''} ${item.client.user.nom || ''}`.trim() : `Client #${item.client_id}`;
                    const infName = item.infirmier?.user ? `${item.infirmier.user.prenom || ''} ${item.infirmier.user.nom || ''}`.trim() : 'En attente d\'affectation';
                    return (
                      <tr key={item.id}>
                        <td className="font-bold text-blue-600">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />
                            {item.reference}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-slate-800">{clientName}</div>
                          {item.client?.telephone && <div className="text-xs text-muted">{item.client.telephone}</div>}
                        </td>
                        <td>
                          <div className="font-semibold text-slate-700">{infName}</div>
                        </td>
                        <td>{renderTypeGardeBadge(item.type_garde)}</td>
                        <td className="text-xs font-medium">
                          {item.date_debut} ➔ {item.date_fin}
                        </td>
                        <td>{Number(item.tarif_journalier).toFixed(2)} MAD</td>
                        <td className="font-bold text-emerald-600">
                          {Number(item.montant_total).toFixed(2)} MAD
                        </td>
                        <td>{renderStatusBadge(item.statut)}</td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          
                          {/* Direct PDF View & Print Button */}
                          <button 
                            onClick={() => handleGeneratePdf(item)} 
                            className="erp-action-btn" 
                            title="Voir & Imprimer le Contrat Officiel PDF"
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                          >
                            <FileDown size={18} />
                          </button>

                          {/* Direct Backend PDF Download */}
                          <button 
                            onClick={() => handleDownloadPdf(item.id, item.reference)} 
                            className="erp-action-btn" 
                            title="Télécharger le fichier PDF Direct"
                            style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
                          >
                            <Download size={18} />
                          </button>

                          {/* Details Modal View Button */}
                          <button onClick={() => handleShowDetails(item)} className="erp-action-btn view" title="Voir le contrat détaillé">
                            <Eye size={18} />
                          </button>
                          
                          {/* Delete Button */}
                          <button onClick={() => handleDelete(item.id)} className="erp-action-btn delete" title="Supprimer">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & PDF Contract Modal */}
      {isModalOpen && selectedContrat && createPortal(
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '70px 16px 40px 16px',
            zIndex: 999999
          }}
        >
          <div 
            className="glass-panel custom-scrollbar animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{
              width: '780px',
              maxWidth: '95vw',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              padding: '2.5rem',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              margin: '0 auto'
            }}
          >
            
            {/* Top Bar Gradient */}
            <div style={{ background: 'linear-gradient(to right, #2563EB 0%, #10B981 100%)', height: '6px', width: '100%', borderRadius: '4px', marginBottom: '16px' }} />

            {/* Contract Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={contractAssets.logo || '/images/logo.png'} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    DAR-SOINS SOINS MÉDICAUX SARL
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                    CONTRAT DE SERVICE
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                    Réf: <strong>{selectedContrat.reference}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* General Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  1. Le Patient / Bénéficiaire
                </div>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedContrat.client?.user ? `${selectedContrat.client.user.prenom || ''} ${selectedContrat.client.user.nom || ''}`.trim() : `Client #${selectedContrat.client_id}`}
                </p>
                {selectedContrat.client?.adresse && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Adresse: {selectedContrat.client.adresse}</p>}
                {selectedContrat.client?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Tél: {selectedContrat.client.telephone}</p>}
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  2. Infirmier(ère) Affecté(e)
                </div>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedContrat.infirmier?.user ? `${selectedContrat.infirmier.user.prenom || ''} ${selectedContrat.infirmier.user.nom || ''}`.trim() : 'En attente d\'attribution'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Spécialité: {selectedContrat.infirmier?.specialite || 'Soins infirmiers à domicile'}</p>
                {selectedContrat.infirmier?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Tél: {selectedContrat.infirmier.telephone}</p>}
              </div>
            </div>

            {/* Garde Specifics */}
            <div style={{ marginBottom: '1.5rem', background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a' }}>Spécificités de la Garde :</span>
                {renderTypeGardeBadge(selectedContrat.type_garde)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: '#1e40af' }}>Date de Début:</strong>
                  <div>{selectedContrat.date_debut}</div>
                </div>
                <div>
                  <strong style={{ color: '#1e40af' }}>Date de Fin:</strong>
                  <div>{selectedContrat.date_fin}</div>
                </div>
                <div>
                  <strong style={{ color: '#1e40af' }}>Horaires de Garde:</strong>
                  <div>{selectedContrat.horaires_garde || 'Selon planning d\'intervention'}</div>
                </div>
              </div>
            </div>

            {/* Prescriptions Medicales */}
            {selectedContrat.prescriptions_medicales && (
              <div style={{ marginBottom: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartPulse size={16} /> Prescriptions Medicales & Protocole de Soins
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {selectedContrat.prescriptions_medicales}
                </p>
              </div>
            )}

            {/* Clauses et Engagements */}
            {selectedContrat.clauses_specifiques && (
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                  Clauses Spécifiques & Engagement de Garde
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {selectedContrat.clauses_specifiques}
                </p>
              </div>
            )}

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '16px 20px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tarif Journalier de Garde:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {Number(selectedContrat.tarif_journalier).toFixed(2)} MAD / jour
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MONTANT TOTAL DU CONTRAT:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                  {Number(selectedContrat.montant_total).toFixed(2)} MAD
                </div>
              </div>
            </div>

            {/* Official Signatures Block with Cachet */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#fafafa', border: '1px dashed #cbd5e1', padding: '18px 20px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Signature du Client / Représentant Légal
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '55px' }}>
                  (Précédée de la mention manuscrite "Lu et Approuvé")
                </div>
                <div style={{ borderBottom: '1px solid #94a3b8', width: '80%' }} />
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Pour la Direction DAR-SOINS
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>
                  (Direction Médicale & Cachet Officiel)
                </div>
                <div style={{ textAlign: 'center', margin: '4px 0' }}>
                  <img src={contractAssets.cachet || '/images/cachet.jpg'} alt="Cachet" style={{ maxHeight: '60px', maxWidth: '140px', display: 'inline-block' }} />
                </div>
                <div style={{ borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto' }} />
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Statut:</span>
                <button onClick={() => handleUpdateStatus(selectedContrat.id, 'actif')} style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Actif</button>
                <button onClick={() => handleUpdateStatus(selectedContrat.id, 'termine')} style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Terminé</button>
                <button onClick={() => handleUpdateStatus(selectedContrat.id, 'resilie')} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Résilié</button>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleGeneratePdf(selectedContrat)} 
                  className="erp-btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <FileDown size={16} /> Imprimer Format PDF
                </button>
                <button 
                  onClick={() => handleDownloadPdf(selectedContrat.id, selectedContrat.reference)} 
                  className="erp-btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', borderColor: '#bfdbfe' }}
                >
                  <Download size={16} /> Télécharger PDF
                </button>
                <button onClick={() => setIsModalOpen(false)} className="erp-btn-primary">
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
