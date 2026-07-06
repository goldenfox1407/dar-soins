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
      return <span className="px-2 py-1 rounded text-[11px] font-semibold text-[#28a745] border border-[#28a745] bg-transparent">Reçu</span>;
    }
    if (normal === 'attente' || normal === 'en attente' || normal === 'pending') {
      return <span className="px-2 py-1 rounded text-[11px] font-semibold text-[#007bff] border border-[#007bff] bg-transparent">En attente</span>;
    }
    return <span className="px-2 py-1 rounded text-[11px] font-semibold text-[#fd7e14] border border-[#fd7e14] bg-transparent">Commandé</span>;
  };

  const getPaymentBadge = (payStatus) => {
    const normal = String(payStatus).toLowerCase().trim();
    if (normal === 'paye' || normal === 'payé' || normal === 'paid') {
      return <span className="px-2 py-1 rounded text-[11px] font-semibold text-[#28a745] border border-[#28a745] bg-transparent">Payé</span>;
    }
    if (normal === 'partiel' || normal === 'partial') {
      return <span className="px-2 py-1 rounded text-[11px] font-semibold text-[#6f42c1] border border-[#6f42c1] bg-transparent">Partiel</span>;
    }
    return <span className="px-2 py-1 rounded text-[11px] font-semibold text-[#fd7e14] border border-[#fd7e14] bg-transparent">Non payé</span>;
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
    <div className="bg-[#f8f9fa] min-h-[calc(100vh-64px)] text-[#495057] font-sans pb-10 relative overflow-y-auto">
      
      {/* Header section */}
      <div className="flex justify-between items-end mb-6 px-6 pt-6">
        <div>
          <h1 className="text-[22px] font-medium text-[#343a40]">Tous les Achats</h1>
          <div className="text-[13px] text-[#6c757d] mt-1 flex gap-2">
            <span>Achats</span>
            <span className="mx-1">|</span>
            <span className="text-[#adb5bd]">Tous les Achats</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-6">
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-[#dee2e6] flex justify-between items-center bg-white">
            <div className="w-[250px] relative">
              <input 
                type="text" 
                placeholder="Rechercher dans la table" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-[#ced4da] rounded-md pl-3 pr-8 py-1.5 text-[13px] focus:outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff] text-[#495057]"
              />
              <Search size={14} className="absolute right-3 top-2.5 text-[#adb5bd]" />
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilterSidebar(true)}
                className="flex items-center gap-1.5 border border-[#ced4da] bg-white text-[#495057] hover:bg-[#f8f9fa] px-3 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer"
              >
                <Filter size={14} /> <span>Filtre</span>
              </button>
              <button className="flex items-center gap-1.5 border border-[#ced4da] bg-white text-[#495057] hover:bg-[#f8f9fa] px-3 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer">
                <FileText size={14} /> <span>PDF</span>
              </button>
              <button className="flex items-center gap-1.5 border border-[#ced4da] bg-white text-[#495057] hover:bg-[#f8f9fa] px-3 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer">
                <FileSpreadsheet size={14} /> <span>EXCEL</span>
              </button>
              <button 
                onClick={() => navigate('/gestionnaire/achats/ajouter')}
                className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-md text-[13px] transition-colors shadow-sm ml-2 cursor-pointer"
              >
                <Plus size={14} /> <span>Créer</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#dee2e6] bg-[#f8f9fa] text-[#495057]">
                  <th className="p-3 w-10 text-center font-semibold">
                    <input type="checkbox" className="rounded border-[#ced4da]" />
                  </th>
                  <th className="p-3 font-semibold w-16">Action</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Référence</th>
                  <th className="p-3 font-semibold">Fournisseur</th>
                  <th className="p-3 font-semibold">Entrepôt</th>
                  <th className="p-3 font-semibold">Statut</th>
                  <th className="p-3 font-semibold">Total</th>
                  <th className="p-3 font-semibold">Payé</th>
                  <th className="p-3 font-semibold">Dû</th>
                  <th className="p-3 font-semibold">Statut Paiement</th>
                  <th className="p-3 font-semibold">Documents</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="p-8 text-center text-[#6c757d]">Chargement...</td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="p-8 text-center text-[#6c757d]">Aucun enregistrement trouvé</td>
                  </tr>
                ) : (
                  currentData.map((item) => {
                    const { total, paid, due } = calculateAmounts(item);
                    return (
                      <tr key={item.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors text-[#495057]">
                        <td className="p-3 text-center">
                          <input type="checkbox" className="rounded border-[#ced4da]" />
                        </td>
                        <td className="p-3 relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="p-1 rounded hover:bg-[#e9ecef] transition-colors text-[#adb5bd] cursor-pointer"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {activeDropdown === item.id && (
                            <div 
                              ref={dropdownRef}
                              className="absolute z-10 top-full left-3 mt-1 w-56 bg-white border border-[#dee2e6] rounded-md shadow-lg py-1 text-[13px]"
                            >
                              <button onClick={() => handleAction('detail', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <Eye size={14} className="text-[#6c757d]" /> Détail d'Achat
                              </button>
                              <button onClick={() => handleAction('edit', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <Edit2 size={14} className="text-[#6c757d]" /> Modifier Achat
                              </button>
                              <button onClick={() => handleAction('return', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <CornerUpLeft size={14} className="text-[#6c757d]" /> Retour d'Achat
                              </button>
                              <button onClick={() => handleAction('show_payments', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <List size={14} className="text-[#6c757d]" /> Afficher Paiements
                              </button>
                              <button onClick={() => handleAction('create_payment', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <PlusCircle size={14} className="text-[#6c757d]" /> Créer Paiement
                              </button>
                              <button onClick={() => handleAction('download_pdf', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <Download size={14} className="text-[#6c757d]" /> Télécharger PDF
                              </button>
                              <button onClick={() => handleAction('print_labels', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <Printer size={14} className="text-[#6c757d]" /> Imprimer Étiquettes
                              </button>
                              <button onClick={() => handleAction('whatsapp', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <MessageSquare size={14} className="text-[#6c757d]" /> Notification WhatsApp
                              </button>
                              <button onClick={() => handleAction('email', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <MessageSquare size={14} className="text-[#6c757d]" /> Notification Email
                              </button>
                              <button onClick={() => handleAction('sms', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <MessageSquare size={14} className="text-[#6c757d]" /> Notification SMS
                              </button>
                              <button onClick={() => handleAction('attach', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#495057]">
                                <Paperclip size={14} className="text-[#6c757d]" /> Joindre Documents
                              </button>
                              <button onClick={() => handleAction('delete', item)} className="w-full text-left px-4 py-2 hover:bg-[#f8f9fa] flex items-center gap-3 text-[#dc3545]">
                                <X size={14} className="text-[#dc3545]" /> Supprimer Achat
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                        <td className="p-3 text-[#2563eb] hover:underline cursor-pointer font-medium">{item.reference}</td>
                        <td className="p-3">{item.fournisseur?.nom || 'N/A'}</td>
                        <td className="p-3 text-[#6c757d]">{item.entrepot?.nom || 'N/A'}</td>
                        <td className="p-3">{getStatusBadge(item.statut)}</td>
                        <td className="p-3">MAD {total.toFixed(2)}</td>
                        <td className="p-3">MAD {paid.toFixed(2)}</td>
                        <td className="p-3">MAD {due.toFixed(2)}</td>
                        <td className="p-3">{getPaymentBadge(item.statut_paiement)}</td>
                        <td className="p-3 text-[#adb5bd]">-</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-4 border-t border-[#dee2e6] flex justify-between items-center text-[13px] text-[#6c757d] bg-white">
            <div className="flex items-center gap-2">
              <span>Lignes par page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="border border-[#ced4da] rounded p-1 outline-none focus:border-[#80bdff]"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>{Math.min((page - 1) * rowsPerPage + 1, filteredData.length)} - {Math.min(page * rowsPerPage, filteredData.length)} sur {filteredData.length}</span>
              <div className="flex gap-1">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="p-1 disabled:opacity-50 hover:bg-[#f8f9fa] rounded flex items-center cursor-pointer"
                >
                  <ChevronLeft size={16} /> <span className="mr-1">préc</span>
                </button>
                <button 
                  disabled={page === totalPages || totalPages === 0} 
                  onClick={() => setPage(p => p + 1)}
                  className="p-1 disabled:opacity-50 hover:bg-[#f8f9fa] rounded flex items-center cursor-pointer"
                >
                  <span className="ml-1">suiv</span> <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar overlay */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowFilterSidebar(false)}></div>
          <div className="relative w-[350px] bg-[#f8f9fa] h-full shadow-2xl animate-fade-in-right flex flex-col border-l border-[#dee2e6]">
            <div className="flex justify-between items-center p-4 border-b border-[#dee2e6] bg-white">
              <h2 className="text-[16px] font-semibold text-[#343a40]">Filtre</h2>
              <button onClick={() => setShowFilterSidebar(false)} className="text-[#adb5bd] hover:text-[#495057] cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-[13px] text-[#495057]">
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input type="date" className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff]" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Référence</label>
                <input type="text" placeholder="Référence" className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff]" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Fournisseur</label>
                <select className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] bg-white">
                  <option>Choisir Fournisseur</option>
                  {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Entrepôt</label>
                <select className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] bg-white">
                  <option>Choisir Entrepôt</option>
                  {entrepots.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Statut</label>
                <select className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] bg-white">
                  <option>Choisir Statut</option>
                  <option>Reçu</option>
                  <option>En attente</option>
                  <option>Commandé</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Statut Paiement</label>
                <select className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] bg-white">
                  <option>Choisir statut</option>
                  <option>Payé</option>
                  <option>Partiel</option>
                  <option>Non payé</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-[#dee2e6] bg-white flex gap-3">
              <button className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2 rounded-md font-semibold flex justify-center items-center gap-2 transition-colors cursor-pointer">
                <Filter size={14} /> Filtrer
              </button>
              <button className="flex-1 bg-[#dc3545] hover:bg-[#c82333] text-white py-2 rounded-md font-semibold flex justify-center items-center gap-2 transition-colors cursor-pointer">
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
