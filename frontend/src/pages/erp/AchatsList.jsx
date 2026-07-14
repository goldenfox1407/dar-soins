import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, Plus, Edit2, Trash2, X, Filter, 
  FileText, FileSpreadsheet, MoreHorizontal, Eye, 
  CornerUpLeft, List, PlusCircle, Download, Printer, 
  MessageSquare, Paperclip, ChevronLeft, ChevronRight 
} from 'lucide-react';
import AchatDetailModal from './AchatDetailModal';
import PaymentListModal from './PaymentListModal';
import AddPaymentModal from './AddPaymentModal';
import UploadDocumentModal from './UploadDocumentModal';
import NotificationModal from './NotificationModal';

export default function AchatsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dynamic options loaded from API
  const [fournisseurs, setFournisseurs] = useState([]);
  const [entrepots, setEntrepots] = useState([]);

  // UI states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Modals state
  const [activeModal, setActiveModal] = useState({ type: null, item: null });

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
    loadOptions();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/achats');
      setData(response.data?.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement achats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const rF = await api.get('/fournisseurs');
      setFournisseurs(rF.data?.data || rF.data || []);
      const rE = await api.get('/entrepots');
      setEntrepots(rE.data?.data || rE.data || []);
    } catch (error) {
      console.error('Erreur chargement options fournisseurs/entrepôts:', error);
    }
  };

  const deleteAchat = async (id, ref) => {
    if (window.confirm(`Voulez-vous supprimer l'achat "${ref}" ?`)) {
      try {
        await api.delete(`/achats/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression achat:', error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.reference?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (item.fournisseur?.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.entrepot?.nom?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getStatusBadge = (statut) => {
    const normal = String(statut).toLowerCase().trim();
    if (normal === 'recu' || normal === 'reçu' || normal === 'received') {
      return <span className="status-badge success">Reçu</span>;
    }
    if (normal === 'attente' || normal === 'en attente' || normal === 'pending') {
      return <span className="status-badge info">En attente</span>;
    }
    return <span className="status-badge warning">Commandé</span>;
  };

  const getPaymentBadge = (payStatus) => {
    const normal = String(payStatus).toLowerCase().trim();
    if (normal === 'paye' || normal === 'payé' || normal === 'paid') {
      return <span className="status-badge success">Payé</span>;
    }
    if (normal === 'partiel' || normal === 'partial') {
      return <span className="status-badge info">Partiel</span>;
    }
    return <span className="status-badge danger">Non payé</span>;
  };

  const calculateAmounts = (item) => {
    const total = parseFloat(item.montant_total) || 0;
    const normalPay = String(item.statut_paiement).toLowerCase();
    let paid = 0;
    
    if (normalPay.includes('paye') && !normalPay.includes('non')) {
      paid = total;
    } else if (normalPay.includes('partiel')) {
      paid = total / 2; // Simulation
    }
    
    const due = total - paid;
    return { total, paid, due };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().replace('T', ' ').slice(0, 16);
  };

  const handleAction = async (actionName, item) => {
    setActiveDropdown(null);
    switch(actionName) {
      case 'detail':
        setActiveModal({ type: 'detail', item });
        break;
      case 'edit':
        navigate(`/gestionnaire/achats/modifier/${item.id}`);
        break;
      case 'return':
        navigate(`/gestionnaire/achats/retour/${item.id}`);
        break;
      case 'show_payments':
        setActiveModal({ type: 'show_payments', item });
        break;
      case 'create_payment':
        setActiveModal({ type: 'create_payment', item });
        break;
      case 'download_pdf':
        window.open(`http://localhost:8000/api/achats/${item.id}/pdf`, '_blank');
        break;
      case 'print_labels':
        window.open(`http://localhost:8000/api/achats/${item.id}/labels`, '_blank');
        break;
      case 'whatsapp':
      case 'email':
      case 'sms':
        setActiveModal({ type: actionName, item });
        break;
      case 'attach':
        setActiveModal({ type: 'attach', item });
        break;
      case 'delete':
        deleteAchat(item.id, item.reference);
        break;
    }
  };

  const closeModal = () => setActiveModal({ type: null, item: null });

  return (
    <div className="erp-page animate-fade-in">
      
      {/* Header section */}
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Tous les Achats</h1>
          <p className="erp-page-subtitle">Gérez vos commandes d'achats, statuts de réception et règlements.</p>
        </div>
      </header>

      {/* Main Container */}
      <div className="erp-card">
        
        {/* Toolbar */}
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher dans la table..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowFilterSidebar(true)}
              className="erp-btn-secondary"
            >
              <Filter size={14} /> Filtre
            </button>
            <button className="erp-btn-secondary">
              <FileText size={14} /> PDF
            </button>
            <button className="erp-btn-secondary">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button 
              onClick={() => navigate('/gestionnaire/achats/ajouter')}
              className="erp-btn-primary"
            >
              <Plus size={14} /> Créer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="erp-table-container" style={{ minHeight: '400px' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input type="checkbox" />
                </th>
                <th style={{ width: '60px' }}>Action</th>
                <th>Date</th>
                <th>Référence</th>
                <th>Fournisseur</th>
                <th>Entrepôt</th>
                <th>Statut</th>
                <th>Total</th>
                <th>Payé</th>
                <th>Dû</th>
                <th>Statut Paiement</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center py-8 text-muted">Chargement...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-8 text-muted">Aucun enregistrement trouvé</td>
                </tr>
              ) : (
                currentData.map((item) => {
                  const { total, paid, due } = calculateAmounts(item);
                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" />
                      </td>
                      <td style={{ position: 'relative' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === item.id ? null : item.id);
                          }}
                          className="erp-btn-secondary"
                          style={{ padding: '4px' }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === item.id && (
                          <div 
                            ref={dropdownRef}
                            className="glass-panel"
                            style={{ position: 'absolute', zIndex: 10, top: '100%', left: '12px', width: '220px', padding: '6px 0', display: 'flex', flexDirection: 'column', gap: '2px', background: '#FFFFFF', boxShadow: 'var(--card-shadow-hover)' }}
                          >
                            <button onClick={() => handleAction('detail', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <Eye size={14} style={{ color: 'var(--text-muted)' }} /> Détail d'Achat
                            </button>
                            <button onClick={() => handleAction('edit', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <Edit2 size={14} style={{ color: 'var(--text-muted)' }} /> Modifier Achat
                            </button>
                            <button onClick={() => handleAction('return', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <CornerUpLeft size={14} style={{ color: 'var(--text-muted)' }} /> Retour d'Achat
                            </button>
                            <button onClick={() => handleAction('show_payments', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <List size={14} style={{ color: 'var(--text-muted)' }} /> Afficher Paiements
                            </button>
                            <button onClick={() => handleAction('create_payment', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <PlusCircle size={14} style={{ color: 'var(--text-muted)' }} /> Créer Paiement
                            </button>
                            <button onClick={() => handleAction('download_pdf', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <Download size={14} style={{ color: 'var(--text-muted)' }} /> Télécharger PDF
                            </button>
                            <button onClick={() => handleAction('print_labels', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <Printer size={14} style={{ color: 'var(--text-muted)' }} /> Imprimer Étiquettes
                            </button>
                            <button onClick={() => handleAction('whatsapp', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <MessageSquare size={14} style={{ color: 'var(--text-muted)' }} /> WhatsApp
                            </button>
                            <button onClick={() => handleAction('email', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <MessageSquare size={14} style={{ color: 'var(--text-muted)' }} /> Email
                            </button>
                            <button onClick={() => handleAction('sms', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <MessageSquare size={14} style={{ color: 'var(--text-muted)' }} /> SMS
                            </button>
                            <button onClick={() => handleAction('attach', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <Paperclip size={14} style={{ color: 'var(--text-muted)' }} /> Joindre Docs
                            </button>
                            <button onClick={() => handleAction('delete', item)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--danger-color)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <X size={14} /> Supprimer Achat
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                      <td style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{item.reference}</td>
                      <td>{item.fournisseur?.nom || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.entrepot?.nom || 'N/A'}</td>
                      <td>{getStatusBadge(item.statut)}</td>
                      <td className="font-semibold">MAD {total.toFixed(2)}</td>
                      <td className="font-semibold text-emerald-500">MAD {paid.toFixed(2)}</td>
                      <td className="font-semibold text-amber-500">MAD {due.toFixed(2)}</td>
                      <td>{getPaymentBadge(item.statut_paiement)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>-</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Lignes par page :</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              style={{ border: '1px solid var(--card-border)', borderRadius: '4px', padding: '4px', outline: 'none' }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>{Math.min((page - 1) * rowsPerPage + 1, filteredData.length)} - {Math.min(page * rowsPerPage, filteredData.length)} sur {filteredData.length}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="erp-btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
              >
                <ChevronLeft size={16} /> Préc
              </button>
              <button 
                disabled={page === totalPages || totalPages === 0} 
                onClick={() => setPage(p => p + 1)}
                className="erp-btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
              >
                Suiv <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar overlay */}
      {showFilterSidebar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowFilterSidebar(false)}></div>
          <div className="animate-fade-in-right" style={{ position: 'relative', width: '350px', background: '#FFFFFF', height: '100%', boxShadow: 'var(--card-shadow-hover)', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--card-border)', background: '#FFFFFF' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Filtre</h2>
              <button onClick={() => setShowFilterSidebar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="custom-scrollbar" style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="erp-form-group">
                <label>Date</label>
                <input type="date" />
              </div>
              <div className="erp-form-group">
                <label>Référence</label>
                <input type="text" placeholder="Référence" />
              </div>
              <div className="erp-form-group">
                <label>Fournisseur</label>
                <select className="bg-white">
                  <option>Choisir Fournisseur</option>
                  {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div className="erp-form-group">
                <label>Entrepôt</label>
                <select className="bg-white">
                  <option>Choisir Entrepôt</option>
                  {entrepots.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>
              <div className="erp-form-group">
                <label>Statut</label>
                <select className="bg-white">
                  <option>Choisir Statut</option>
                  <option>Reçu</option>
                  <option>En attente</option>
                  <option>Commandé</option>
                </select>
              </div>
              <div className="erp-form-group">
                <label>Statut Paiement</label>
                <select className="bg-white">
                  <option>Choisir statut</option>
                  <option>Payé</option>
                  <option>Partiel</option>
                  <option>Non payé</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--card-border)', background: '#FFFFFF', display: 'flex', gap: '12px' }}>
              <button className="erp-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Filter size={14} /> Filtrer
              </button>
              <button className="erp-btn-secondary" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
                <X size={14} /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal.type === 'detail' && (
        <AchatDetailModal achatId={activeModal.item.id} onClose={closeModal} />
      )}
      {activeModal.type === 'show_payments' && (
        <PaymentListModal achatId={activeModal.item.id} reference={activeModal.item.reference} onClose={closeModal} />
      )}
      {activeModal.type === 'create_payment' && (
        <AddPaymentModal 
          achatId={activeModal.item.id} 
          reference={activeModal.item.reference} 
          dueAmount={calculateAmounts(activeModal.item).due} 
          onClose={closeModal} 
          onPaymentAdded={fetchData} 
        />
      )}
      {activeModal.type === 'attach' && (
        <UploadDocumentModal achatId={activeModal.item.id} reference={activeModal.item.reference} onClose={closeModal} onUploadSuccess={fetchData} />
      )}
      {(activeModal.type === 'email' || activeModal.type === 'sms' || activeModal.type === 'whatsapp') && (
        <NotificationModal achatId={activeModal.item.id} reference={activeModal.item.reference} type={activeModal.type} onClose={closeModal} />
      )}

      {/* Basic styles for animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out;
        }
      `}} />
    </div>
  );
}
