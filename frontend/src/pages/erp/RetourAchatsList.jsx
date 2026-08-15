import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RotateCcw, Eye, Trash2, X, CheckCircle, Clock, XCircle, FileText, Building, Package, FileDown, ArrowLeftRight } from 'lucide-react';
import api from '../../services/api';
import contractAssets from '../../assets/contract_assets.json';

export default function RetourAchatsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRetour, setSelectedRetour] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/retour-achats');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching retour-achats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatut) => {
    try {
      await api.patch(`/retour-achats/${id}/statut`, { statut: newStatut });
      fetchData();
      if (selectedRetour && selectedRetour.id === id) {
        setSelectedRetour({ ...selectedRetour, statut: newStatut });
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut du retour.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce retour d\'achat ? Le stock sera réajusté automatiquement.')) {
      try {
        await api.delete(`/retour-achats/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression du retour.");
      }
    }
  };

  const handleShowDetails = (retour) => {
    setSelectedRetour(retour);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (statut) => {
    switch (statut) {
      case 'Termine':
      case 'termine':
      case 'complete':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Terminé (Stock Déduit)
          </span>
        );
      case 'En attente':
      case 'en_attente':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> En Attente
          </span>
        );
      case 'Annule':
      case 'annule':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={14} /> Annulé
          </span>
        );
      default:
        return statut;
    }
  };

  // Official PDF Print Generator for Return Notes (matching Devis / Factures)
  const handleGeneratePdf = (retour) => {
    if (!retour) return;

    const logoSrc = contractAssets.logo || '/images/logo.png';
    const cachetSrc = contractAssets.cachet || '/images/cachet.jpg';
    const supplierName = retour.fournisseur?.nom || 'Fournisseur Inconnu';
    const supplierTel = retour.fournisseur?.telephone || 'Non renseigné';
    const supplierEmail = retour.fournisseur?.email || 'Non renseigné';
    const supplierAddr = retour.fournisseur?.adresse || 'Non renseignée';
    const warehouseName = retour.entrepot?.nom || 'Entrepôt Principal';
    const dateStr = retour.created_at ? new Date(retour.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const achatRef = retour.achat?.reference || `Achat #${retour.achat_id || 'N/A'}`;

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      alert("Veuillez autoriser les popups pour ouvrir le bon de retour.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Bon de Retour Achat — ${retour.reference}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
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
          .a4-wrapper { width: 100%; max-width: 100%; margin: 0 auto; padding: 0; }
          .no-print-bar {
            background: #0f172a; color: #ffffff; padding: 10px 16px; border-radius: 8px;
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
          }
          .btn-print {
            background: #2563EB; color: white; border: none; padding: 8px 16px;
            border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer;
          }
          .top-bar {
            background: linear-gradient(to right, #2563EB 0%, #10B981 100%);
            height: 6px; width: 100%; margin-bottom: 12px;
          }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .header-table td { vertical-align: middle; }
          .meta-table { width: 270px; margin-left: auto; border-collapse: collapse; font-size: 10px; }
          .meta-table td { padding: 2px 0; }
          .meta-table td.lbl { color: #64748B; font-weight: bold; width: 48%; }
          .meta-table td.val { text-align: right; font-weight: bold; color: #1E293B; }
          .banner-doc {
            text-align: center; background: #F1F5F9; border: 1px solid #CBD5E1;
            padding: 6px 10px; font-size: 11px; font-weight: bold; color: #0F172A;
            border-radius: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;
          }
          .parties-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 12px; }
          .party-box { border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden; }
          .party-title {
            background: #2563EB; color: white; padding: 5px 10px;
            font-weight: bold; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px;
          }
          .party-details { padding: 8px 10px; line-height: 1.45; background: #F8FAFC; color: #334155; font-size: 9.5px; }
          .items-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 12px; }
          .items-table thead tr { background: #2563EB; color: white; }
          .items-table th { padding: 7px 10px; font-size: 9.5px; font-weight: bold; text-transform: uppercase; text-align: left; }
          .items-table th.r { text-align: right; }
          .items-table tbody tr { border-bottom: 1px solid #E2E8F0; }
          .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
          .items-table td { padding: 6px 10px; vertical-align: middle; font-size: 9.5px; word-wrap: break-word; }
          .items-table td.r { text-align: right; }
          .totals-table {
            width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0;
            border-radius: 6px; overflow: hidden; margin-bottom: 12px;
          }
          .totals-table td { padding: 6px 12px; font-size: 10px; }
          .totals-table td.lbl { color: #475569; font-weight: bold; }
          .totals-table td.val { text-align: right; color: #1E293B; font-weight: bold; }
          .totals-table tr.grand-total { background: #2563EB; color: white; }
          .totals-table tr.grand-total td.lbl, .totals-table tr.grand-total td.val { color: white; font-size: 11px; padding: 7px 12px; }
          .signatures-table {
            width: 100%; table-layout: fixed; border-collapse: collapse;
            margin-top: 10px; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid;
          }
          .sig-box {
            border: 1px dashed #CBD5E1; border-radius: 6px; padding: 8px 10px;
            height: 75px; background: #FAFAFA; vertical-align: top;
          }
          .sig-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #0F172A; margin-bottom: 3px; }
          .sig-text { font-size: 8.5px; color: #64748B; font-style: italic; }
          .legal {
            padding-top: 6px; border-top: 1px solid #E2E8F0; font-size: 8.5px;
            color: #64748B; line-height: 1.45; text-align: center;
          }
          .legal strong { color: #475569; }
          .bottom-bar {
            background: linear-gradient(to right, #10B981 0%, #2563EB 100%);
            height: 4px; width: 100%; margin-top: 10px;
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
            <span>Aperçu Officiel — Bon de Retour d'Achat ${retour.reference}</span>
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
                <div style="font-size: 19px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">BON DE RETOUR ACHAT</div>
                <div style="margin-top: 4px; display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; color: #1E293B;">
                  ${retour.reference}
                </div>
              </td>
            </tr>
          </table>

          <!-- Company Meta & Return Meta -->
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
                    <td class="lbl">Date du retour :</td>
                    <td class="val">${dateStr}</td>
                  </tr>
                  <tr>
                    <td class="lbl">Achat d'origine :</td>
                    <td class="val" style="color: #2563EB;">${achatRef}</td>
                  </tr>
                  <tr>
                    <td class="lbl">Statut :</td>
                    <td class="val" style="color: #15803D; text-transform: uppercase;">${retour.statut}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div class="banner-doc">
            BON OFFICIEL DE RETOUR DE MARCHANDISES AU FOURNISSEUR
          </div>

          <!-- Parties Table -->
          <table class="parties-table">
            <tr>
              <td style="width: 48%; vertical-align: top;">
                <div class="party-box">
                  <div class="party-title">1. Destinataire (Fournisseur)</div>
                  <div class="party-details">
                    <strong style="color: #000; font-size: 10.5px;">${supplierName}</strong><br>
                    <strong>Téléphone :</strong> ${supplierTel}<br>
                    <strong>Email :</strong> ${supplierEmail}<br>
                    <strong>Adresse :</strong> ${supplierAddr}
                  </div>
                </div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%; vertical-align: top;">
                <div class="party-box">
                  <div class="party-title">2. Expéditeur (Établissement & Dépôt)</div>
                  <div class="party-details">
                    <strong style="color: #000; font-size: 10.5px;">DAR-SOINS — Dépôt de Stock</strong><br>
                    <strong>Entrepôt Source :</strong> ${warehouseName}<br>
                    <strong>Responsable Stock :</strong> Service Logistique Médicale<br>
                    <strong>Astreinte :</strong> 05 37 00 00 00
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 45%;">Désignation des Articles Retournés</th>
                <th class="r" style="width: 15%;">Quantité</th>
                <th class="r" style="width: 20%;">Coût Unitaire</th>
                <th class="r" style="width: 20%;">Sous-Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${(retour.lignes || []).map(l => `
                <tr>
                  <td>
                    <strong style="color: #0F172A;">${l.produit?.nom || 'Article'}</strong>
                  </td>
                  <td class="r"><strong>${l.quantite}</strong></td>
                  <td class="r">${Number(l.cout_unitaire).toFixed(2)} MAD</td>
                  <td class="r"><strong>${Number(l.sous_total).toFixed(2)} MAD</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${retour.notes ? `
            <div style="font-size: 9.5px; font-weight: bold; color: #0F172A; text-transform: uppercase; margin: 8px 0 4px 0;">Motif & Justification du Retour</div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 10px; font-size: 9px; color: #334155; margin-bottom: 10px;">${retour.notes}</div>
          ` : ''}

          <!-- Totals Table -->
          <table class="totals-table">
            <tr class="grand-total">
              <td class="lbl" style="width: 70%;">VALEUR TOTALE DES MARCHANDISES RETOURNÉES</td>
              <td class="val">${Number(retour.montant_total).toFixed(2)} MAD</td>
            </tr>
          </table>

          <!-- Signatures Table with Cachet in DAR-SOINS Box -->
          <table class="signatures-table">
            <tr>
              <td style="width: 48%;" class="sig-box">
                <div class="sig-label">Pour Réception Fournisseur / Transporteur</div>
                <div class="sig-text">Date, Nom & Signature du Réceptionnaire</div>
                <div style="height: 55px;"></div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%;" class="sig-box">
                <div class="sig-label">Pour la Direction DAR-SOINS</div>
                <div class="sig-text">Signature & Cachet Officiel de l'Établissement</div>
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
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    pdfWindow.document.open();
    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
  };

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const ref = item.reference || '';
    const four = item.fournisseur?.nom || '';
    const ent = item.entrepot?.nom || '';
    const ach = item.achat?.reference || '';
    const not = item.notes || '';
    return (
      ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      four.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.toLowerCase().includes(searchTerm.toLowerCase()) ||
      not.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Retour des Achats</h1>
          <p className="erp-page-subtitle">Gérez les retours de produits aux fournisseurs et ajustez automatiquement les stocks d'entrepôt.</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/retours/achats/ajouter')} className="erp-btn-primary">
          <Plus size={18} /> Nouveau Retour d'Achat
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, fournisseur, entrepôt ou achat d'origine..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted">Chargement des retours d'achat...</div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Référence Retour</th>
                  <th>Achat d'Origine</th>
                  <th>Fournisseur</th>
                  <th>Entrepôt</th>
                  <th>Montant Total</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted">
                      Aucun retour d'achat trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '—';
                    return (
                      <tr key={item.id}>
                        <td className="text-xs text-muted">{dateStr}</td>
                        <td className="font-bold text-blue-600">
                          <div className="flex items-center gap-2">
                            <RotateCcw size={16} className="text-amber-500" />
                            {item.reference}
                          </div>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-700">
                            {item.achat?.reference || `Achat #${item.achat_id || 'N/A'}`}
                          </span>
                        </td>
                        <td>
                          <div className="font-bold text-slate-800">{item.fournisseur?.nom || 'Fournisseur Inconnu'}</div>
                          {item.fournisseur?.telephone && <div className="text-xs text-muted">{item.fournisseur.telephone}</div>}
                        </td>
                        <td>
                          <span className="text-xs font-medium text-slate-600">
                            {item.entrepot?.nom || 'Entrepôt Principal'}
                          </span>
                        </td>
                        <td className="font-bold text-emerald-600">
                          {Number(item.montant_total).toFixed(2)} MAD
                        </td>
                        <td>{renderStatusBadge(item.statut)}</td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          
                          {/* Direct PDF Bon de Retour Button */}
                          <button 
                            onClick={() => handleGeneratePdf(item)} 
                            className="erp-action-btn" 
                            title="Voir & Imprimer le Bon de Retour Officiel PDF"
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                          >
                            <FileDown size={18} />
                          </button>

                          {/* Details View Button */}
                          <button onClick={() => handleShowDetails(item)} className="erp-action-btn view" title="Voir les détails du retour">
                            <Eye size={18} />
                          </button>
                          
                          {/* Delete Button */}
                          <button onClick={() => handleDelete(item.id)} className="erp-action-btn delete" title="Supprimer le retour">
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

      {/* Details & Lines Modal */}
      {isModalOpen && selectedRetour && createPortal(
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

            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={contractAssets.logo || '/images/logo.png'} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    DAR-SOINS SOINS MÉDICAUX SARL
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                    DÉTAILS DU RETOUR D'ACHAT
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                    Réf: <strong>{selectedRetour.reference}</strong> | Achat d'origine: <strong>{selectedRetour.achat?.reference || `Achat #${selectedRetour.achat_id || 'N/A'}`}</strong>
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
                  Fournisseur Destinataire
                </div>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedRetour.fournisseur?.nom || 'Fournisseur Inconnu'}
                </p>
                {selectedRetour.fournisseur?.adresse && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Adresse: {selectedRetour.fournisseur.adresse}</p>}
                {selectedRetour.fournisseur?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Tél: {selectedRetour.fournisseur.telephone}</p>}
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Entrepôt & Statut
                </div>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedRetour.entrepot?.nom || 'Entrepôt Principal'}
                </p>
                <div style={{ marginTop: '6px' }}>{renderStatusBadge(selectedRetour.statut)}</div>
              </div>
            </div>

            {/* Returned Items Table */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} /> Articles Retournés au Fournisseur
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Produit</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Quantité Retournée</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Coût Unitaire</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Sous-Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedRetour.lignes || []).map((ligne, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                        {ligne.produit?.nom || `Produit #${ligne.produit_id}`}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#b91c1c' }}>
                        {ligne.quantite}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        {Number(ligne.cout_unitaire).toFixed(2)} MAD
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        {Number(ligne.sous_total).toFixed(2)} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {selectedRetour.notes && (
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Motif / Notes :</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#334155' }}>{selectedRetour.notes}</p>
              </div>
            )}

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1.5px solid #86efac', padding: '14px 18px', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>MONTANT TOTAL DU RETOUR:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>
                {Number(selectedRetour.montant_total).toFixed(2)} MAD
              </span>
            </div>

            {/* Official Signatures Block with Cachet */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#fafafa', border: '1px dashed #cbd5e1', padding: '18px 20px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Pour Réception Fournisseur
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '55px' }}>
                  (Date & Signature du Réceptionnaire)
                </div>
                <div style={{ borderBottom: '1px solid #94a3b8', width: '80%' }} />
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Pour la Direction DAR-SOINS
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>
                  (Logistique & Cachet Officiel)
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
                <button onClick={() => handleUpdateStatus(selectedRetour.id, 'Termine')} style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Terminé</button>
                <button onClick={() => handleUpdateStatus(selectedRetour.id, 'En attente')} style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>En Attente</button>
                <button onClick={() => handleUpdateStatus(selectedRetour.id, 'Annule')} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Annulé</button>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleGeneratePdf(selectedRetour)} 
                  className="erp-btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <FileDown size={16} /> Imprimer Bon de Retour PDF
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
