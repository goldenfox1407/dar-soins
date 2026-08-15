import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Eye, Trash2, X, CheckCircle, Clock, AlertTriangle, ShieldCheck, Printer, Calendar, User, HeartPulse, FileDown, Download } from 'lucide-react';
import api from '../../services/api';

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

  // Dedicated PDF Generation & Print Function for each row
  const handleGeneratePdf = (contrat) => {
    if (!contrat) return;

    const clientName = contrat.client?.user 
      ? `${contrat.client.user.prenom || ''} ${contrat.client.user.nom || ''}`.trim() 
      : `Client #${contrat.client_id}`;
    
    const clientTel = contrat.client?.telephone || contrat.client?.user?.telephone || 'Non renseigné';
    const clientAddr = contrat.client?.adresse || 'Non renseignée';

    const infName = contrat.infirmier?.user 
      ? `${contrat.infirmier.user.prenom || ''} ${contrat.infirmier.user.nom || ''}`.trim() 
      : 'Infirmier de garde désigné par la direction';
    const infTel = contrat.infirmier?.telephone || contrat.infirmier?.user?.telephone || 'Ligne d\'urgence DAR-SOINS';

    let typeGardeLabel = 'Garde de Nuit (20h - 08h)';
    if (contrat.type_garde === 'jour') typeGardeLabel = 'Garde de Jour (08h - 20h)';
    if (contrat.type_garde === '24h') typeGardeLabel = 'Garde Continue 24h/24 (Relève d\'équipe)';
    if (contrat.type_garde === 'post_operatoire') typeGardeLabel = 'Soins Post-opératoires Intensifs';
    if (contrat.type_garde === 'accompagnement_senior') typeGardeLabel = 'Accompagnement Senior Dépendance';

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
        <title>Contrat de Garde — ${contrat.reference}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100%;
            background: #ffffff;
            color: #0f172a;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9.5pt;
            line-height: 1.35;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-wrapper {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
          }
          .no-print-bar {
            background: #0f172a;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .btn-print {
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .brand-title {
            font-size: 16pt;
            font-weight: 800;
            color: #2563eb;
          }
          .brand-sub {
            font-size: 8pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .doc-banner {
            text-align: center;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
            font-size: 11pt;
            font-weight: 800;
            color: #0f172a;
            border-radius: 4px;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .layout-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .card-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 8.5pt;
          }
          .card-header {
            font-size: 8pt;
            font-weight: 800;
            color: #2563eb;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 5px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 10px;
          }
          .data-table th, .data-table td {
            border: 1px solid #e2e8f0;
            padding: 5px 8px;
            font-size: 8.5pt;
            word-wrap: break-word;
          }
          .data-table th {
            background: #f8fafc;
            color: #475569;
            width: 28%;
            text-align: left;
          }
          .section-heading {
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            margin: 10px 0 4px 0;
            color: #0f172a;
          }
          .text-block {
            background: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 8pt;
            color: #334155;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: break-word;
            line-height: 1.4;
            margin-bottom: 10px;
          }
          .medical-block {
            background: #fef2f2;
            border-color: #fecaca;
            color: #991b1b;
          }
          .financial-table {
            width: 100%;
            border-collapse: collapse;
            background: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 6px;
            margin: 10px 0;
          }
          .financial-table td {
            padding: 8px 12px;
          }
          .sig-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .sig-cell {
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            padding: 8px 10px;
            height: 85px;
            vertical-align: top;
            background: #fafafa;
          }
          .footer-text {
            text-align: center;
            font-size: 7.5pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            margin-top: 15px;
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
            <span>Aperçu du Contrat Officiel — ${contrat.reference}</span>
            <div>
              <button class="btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
            </div>
          </div>

          <table class="header-table">
            <tr>
              <td style="vertical-align: top;">
                <div class="brand-title">DAR-SOINS 🩺</div>
                <div class="brand-sub">Soins Infirmiers & Garde Médicale à Domicile</div>
                <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">
                  Agrément Ministère de la Santé | Tél: 05 37 00 00 00 | Rabat - Casablanca - Maroc
                </div>
              </td>
              <td style="text-align: right; vertical-align: top; width: 220px;">
                <div style="font-size: 8pt; color: #64748b; text-transform: uppercase;">CONTRAT DE SERVICE</div>
                <div style="font-size: 13pt; font-weight: 800; color: #0f172a;">${contrat.reference}</div>
                <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">Date: ${contrat.date_debut}</div>
              </td>
            </tr>
          </table>

          <div class="doc-banner">
            CONTRAT DE PRESTATION DE SERVICE DE GARDE INFIRMIÈRE
          </div>

          <!-- Parties Table -->
          <table class="layout-table">
            <tr>
              <td style="width: 48%; vertical-align: top;">
                <div class="card-box">
                  <div class="card-header">1. Le Patient / Bénéficiaire</div>
                  <p><strong>Nom & Prénom:</strong> ${clientName}</p>
                  <p><strong>Téléphone:</strong> ${clientTel}</p>
                  <p><strong>Adresse:</strong> ${clientAddr}</p>
                </div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%; vertical-align: top;">
                <div class="card-box">
                  <div class="card-header">2. Infirmier(ère) Affecté(e)</div>
                  <p><strong>Personnel Soignant:</strong> ${infName}</p>
                  <p><strong>Coordination:</strong> DAR-SOINS Soins à Domicile</p>
                  <p><strong>Ligne Directe / Astreinte:</strong> ${infTel}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Guard Specifications Table -->
          <table class="data-table">
            <tr>
              <th>Cas & Type de Garde</th>
              <td><strong>${typeGardeLabel}</strong></td>
            </tr>
            <tr>
              <th>Période d'Intervention</th>
              <td>Du <strong>${contrat.date_debut}</strong> au <strong>${contrat.date_fin}</strong></td>
            </tr>
            <tr>
              <th>Horaires Convenus</th>
              <td>${contrat.horaires_garde || 'Selon planning médical établi'}</td>
            </tr>
            <tr>
              <th>Tarif Journalier</th>
              <td><strong>${Number(contrat.tarif_journalier).toFixed(2)} MAD / jour</strong></td>
            </tr>
          </table>

          ${contrat.prescriptions_medicales ? `
            <div class="section-heading" style="color: #991b1b;">Protocole Médical & Prescriptions à Domicile</div>
            <div class="text-block medical-block">${contrat.prescriptions_medicales}</div>
          ` : ''}

          <div class="section-heading">Clauses Juridiques & Engagements de Garde</div>
          <div class="text-block">${contrat.clauses_specifiques || 'Les parties s\'engagent au respect strict du protocole de soins et de la déontologie médicale.'}</div>

          <!-- Financial Card -->
          <table class="financial-table">
            <tr>
              <td style="width: 50%;">
                <div style="font-size: 8pt; color: #166534; font-weight: 700; text-transform: uppercase;">TARIF JOURNALIER CONVENU</div>
                <div style="font-size: 11pt; font-weight: 800; color: #0f172a;">${Number(contrat.tarif_journalier).toFixed(2)} MAD / jour</div>
              </td>
              <td style="text-align: right; width: 50%;">
                <div style="font-size: 8pt; color: #166534; font-weight: 700; text-transform: uppercase;">MONTANT TOTAL DU CONTRAT</div>
                <div style="font-size: 14pt; font-weight: 900; color: #15803d;">${Number(contrat.montant_total).toFixed(2)} MAD</div>
              </td>
            </tr>
          </table>

          <!-- Signatures Table -->
          <table class="sig-table">
            <tr>
              <td style="width: 48%;" class="sig-cell">
                <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a;">Signature du Client / Représentant Légal</div>
                <div style="font-size: 7.5pt; color: #64748b; font-style: italic; margin-top: 1px;">"Lu et Approuvé, Bon pour Accord"</div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%;" class="sig-cell">
                <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a;">Pour la Direction DAR-SOINS</div>
                <div style="font-size: 7.5pt; color: #64748b; font-style: italic; margin-top: 1px;">Signature & Cachet de l'Établissement</div>
              </td>
            </tr>
          </table>

          <div class="footer-text">
            DAR-SOINS SARL AU — Document contractuel généré électroniquement conforme aux dispositions légales relatives aux prestations de soins à domicile au Maroc.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
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
          <p className="erp-page-subtitle">Gérez les contrats de services de garde à domicile et générez les documents officiels en PDF.</p>
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
                          
                          {/* Direct PDF Form View Button in each row */}
                          <button 
                            onClick={() => handleGeneratePdf(item)} 
                            className="erp-action-btn" 
                            title="Voir & Télécharger le Contrat sous forme PDF"
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                          >
                            <FileDown size={18} />
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
              width: '760px',
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
            
            {/* Contract Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  DAR-SOINS — ÉTABLISSEMENT DE SOINS À DOMICILE
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  CONTRAT DE SERVICE DE GARDE INFIRMIÈRE
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                  Réf: <strong>{selectedContrat.reference}</strong> | Statut: {renderStatusBadge(selectedContrat.statut)}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* General Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> Le Patient / Client
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedContrat.client?.user ? `${selectedContrat.client.user.prenom || ''} ${selectedContrat.client.user.nom || ''}`.trim() : `Client #${selectedContrat.client_id}`}
                </p>
                {selectedContrat.client?.adresse && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Adresse: {selectedContrat.client.adresse}</p>}
                {selectedContrat.client?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Tél: {selectedContrat.client.telephone}</p>}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Infirmier(ère) Affecté(e)
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedContrat.infirmier?.user ? `${selectedContrat.infirmier.user.prenom || ''} ${selectedContrat.infirmier.user.nom || ''}`.trim() : 'En attente d\'attribution'}
                </p>
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

            {/* Official Signatures Block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#fafafa', border: '1px dashed #cbd5e1', padding: '18px 20px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Signature du Client / Représentant Légal
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '35px' }}>
                  (Précédée de la mention manuscrite "Lu et Approuvé")
                </div>
                <div style={{ borderBottom: '1px solid #94a3b8', width: '80%' }} />
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Pour l'Établissement DAR-SOINS
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '35px' }}>
                  (Direction Médicale & Cachet Officiel)
                </div>
                <div style={{ borderBottom: '1px solid #94a3b8', width: '80%' }} />
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
                  <FileDown size={16} /> Ouvrir Format PDF
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
