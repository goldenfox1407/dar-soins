import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { LogOut, Activity, Calendar, Clock, MapPin, CheckCircle, FileText, Syringe, HeartPulse, UploadCloud, Map, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';

export default function ClientDashboard() {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [formData, setFormData] = useState({
    produit_id: '',
    date_heure: '',
    latitude: '',
    longitude: '',
    details: '',
    fichier: null
  });
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchData();
    
    if (location.state && location.state.selectedProduitId) {
      setShowOrderForm(true);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intRes, prodRes] = await Promise.all([
        api.get('/interventions'),
        api.get('/produits')
      ]);
      setInterventions(intRes.data || []);
      const allProds = prodRes.data.data || prodRes.data || [];
      // Keep all products so that gardes can also be requested
      setProduits(allProds);
      
      // If a product was selected from the catalog, select it, otherwise pick the first one
      if (location.state && location.state.selectedProduitId) {
        setFormData(prev => ({ ...prev, produit_id: location.state.selectedProduitId }));
      } else if (allProds.length > 0) {
        setFormData(prev => ({ ...prev, produit_id: allProds[0].id }));
      }
    } catch (err) {
      console.error("Erreur chargement donnees", err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(data => {
            setAddress(data.display_name);
            setIsLocating(false);
          })
          .catch(() => setIsLocating(false));
      },
      (error) => {
        console.error(error);
        setLocationError("Impossible d'obtenir votre position. Veuillez autoriser l'accès au GPS.");
        setIsLocating(false);
      }
    );
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert("Veuillez d'abord détecter votre position.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('produit_id', formData.produit_id);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('type', 'ponctuel');
      data.append('date_heure', formData.date_heure);
      
      if (formData.details) {
        data.append('description_probleme', formData.details);
      }
      if (formData.fichier) {
        data.append('fichier_joint', formData.fichier);
      }

      await api.post('/interventions/commander', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Demande envoyée avec succès ! Un infirmier vous a été affecté.');
      setShowOrderForm(false);
      setFormData({ ...formData, details: '', fichier: null });
      fetchData();
    } catch (err) {
      console.error("Erreur commande", err);
      let errorMsg = 'Erreur lors de la commande.';
      if (err.response && err.response.data) {
        errorMsg += '\n\nDétail : ' + (err.response.data.message || '');
        if (err.response.data.errors) {
          errorMsg += '\n' + JSON.stringify(err.response.data.errors, null, 2);
        }
      }
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevisResponse = async (id, accepte) => {
    try {
      await api.post(`/interventions/${id}/reponse-client`, { accepte });
      alert(accepte ? "Devis accepté avec succès !" : "Devis refusé.");
      fetchData();
    } catch (err) {
      alert("Erreur lors de la réponse au devis.");
    }
  };

  const activeInterventions = interventions.filter(i => i.statut !== 'terminee');
  const pastInterventions = interventions.filter(i => i.statut === 'terminee');
  const actionRequired = activeInterventions.filter(i => i.statut === 'en_attente_reponse_client');

  const getStatusInfo = (statut) => {
    const map = {
      'en_attente_affectation': { label: "En attente d'affectation", color: 'warning', icon: Clock },
      'en_attente_reponse_infirmier': { label: 'Attente confirmation soignant', color: 'info', icon: Clock },
      'infirmier_accepte': { label: 'Soignant confirmé', color: 'info', icon: CheckCircle },
      'devis_genere': { label: 'Devis en préparation', color: 'info', icon: FileText },
      'en_attente_reponse_client': { label: '⚡ Action requise : Devis à valider', color: 'warning', icon: AlertCircle },
      'acceptee': { label: 'Confirmée', color: 'success', icon: CheckCircle },
      'en_cours': { label: 'En cours', color: 'success', icon: Activity },
      'terminee': { label: 'Terminée', color: 'neutral', icon: CheckCircle },
    };
    return map[statut] || { label: statut, color: 'neutral', icon: Clock };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 animate-fade-in">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-1 text-[#1E293B]">Bonjour, {user?.name?.split(' ')[0] || 'Patient'} 👋</h1>
            <p className="text-slate-500">Gérez vos soins et suivez votre santé en temps réel.</p>
          </div>
          <button 
            onClick={() => setShowOrderForm(!showOrderForm)} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            {showOrderForm ? '✕ Annuler' : '+ Demander un soin'}
          </button>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500">Total Soins</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Activity size={20} className="text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{interventions.length}</p>
            <p className="text-xs text-slate-400 mt-1">{activeInterventions.length} en cours</p>
          </div>

          <div className="stat-card accent-green">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500">Prochain Soin</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Calendar size={20} className="text-emerald-500" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-800">
              {activeInterventions.length > 0 
                ? new Date(activeInterventions[0].date_heure).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                : 'Aucun'
              }
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeInterventions.length > 0 
                ? new Date(activeInterventions[0].date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : 'Planifiez un soin'
              }
            </p>
          </div>

          <div className="stat-card accent-orange">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500">Actions Requises</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionRequired.length > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                <AlertCircle size={20} className={actionRequired.length > 0 ? 'text-amber-500' : 'text-slate-400'} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{actionRequired.length}</p>
            <p className="text-xs text-slate-400 mt-1">{actionRequired.length > 0 ? 'Devis en attente' : 'Tout est à jour'}</p>
          </div>
        </div>

        {showOrderForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 mb-8 animate-scale-in shadow-lg shadow-slate-200/50">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#1E293B]">
              <Syringe className="text-blue-600" /> Nouvelle demande d'intervention
            </h2>
            <form onSubmit={handleOrderSubmit} className="grid md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Soin Requis</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.produit_id}
                  onChange={e => setFormData({...formData, produit_id: e.target.value})}
                  required
                >
                  {produits.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} - {p.prix_client} MAD</option>
                  ))}
                  {produits.length === 0 && <option value="">Aucun soin disponible</option>}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Date et Heure souhaitées</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.date_heure}
                  onChange={e => setFormData({...formData, date_heure: e.target.value})}
                />
              </div>

              {/* Localisation via GPS */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex justify-between">
                  <span>Votre Position Actuelle (GPS)</span>
                  {formData.latitude && <span className="text-emerald-600 text-xs flex items-center gap-1"><CheckCircle size={14}/> Localisé avec succès</span>}
                </label>
                <div className="flex flex-col gap-4">
                  <button 
                    type="button" 
                    onClick={detectLocation}
                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-4 py-3 rounded-xl transition-all font-medium"
                  >
                    <Map size={18} /> {isLocating ? 'Recherche en cours...' : 'Me géolocaliser'}
                  </button>
                  {address && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-slate-700 text-sm">
                      <span className="font-semibold text-blue-700 block mb-1">Adresse approximative :</span>
                      {address}
                    </div>
                  )}
                  {formData.latitude && (
                    <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <MapContainer center={[formData.latitude, formData.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[formData.latitude, formData.longitude]}>
                          <Popup>Votre position</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                </div>
                {locationError && <p className="text-red-500 text-xs mt-1">{locationError}</p>}
              </div>

              {/* Description & Photo */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description du problème (Optionnel)</label>
                <textarea 
                  rows="3"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none transition-all"
                  placeholder="Décrivez vos symptômes ou les détails du soin..."
                  value={formData.details}
                  onChange={e => setFormData({...formData, details: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Joindre un fichier (Optionnel)</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 rounded-xl p-5 transition-all flex items-center justify-center gap-4 relative cursor-pointer">
                  <UploadCloud className="text-slate-400" size={24} />
                  <span className="text-sm text-slate-600">{formData.fichier ? formData.fichier.name : 'Photo ou ordonnance (Max 5MB)'}</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={e => setFormData({...formData, fichier: e.target.files[0]})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.latitude}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Confirmer la demande et Trouver un infirmier'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">Toute demande sera évaluée par notre admin médical.</p>
              </div>

            </form>
          </div>
        )}

        {/* Historique et interventions */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#1E293B]">
              <Clock className="text-blue-600" /> Soins à venir & En cours
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="skeleton-card skeleton" />
                ))}
              </div>
            ) : activeInterventions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-blue-400" size={28} />
                </div>
                <p className="text-slate-700 font-semibold mb-1">Aucun soin prévu</p>
                <p className="text-sm text-slate-400">Cliquez sur "Demander un soin" pour commencer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeInterventions.map(inter => {
                  const status = getStatusInfo(inter.statut);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={inter.id} className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.color === 'success' ? 'bg-emerald-500' : status.color === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`status-badge ${status.color} mb-2`}>
                            <StatusIcon size={14} /> {status.label}
                          </span>
                          <h3 className="text-lg font-bold text-[#1E293B]">{inter.produit?.nom || 'Soin Infirmier'}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{new Date(inter.date_heure).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                          <div className="text-xs text-slate-400">{new Date(inter.date_heure).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      
                      {inter.statut === 'en_attente_reponse_client' && (
                        <div className="mt-4 border-t border-slate-100 pt-4 space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <span className="text-sm font-semibold text-blue-800 flex items-center gap-2"><FileText size={16}/> Devis de la prestation</span>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await api.get(`/devis/${inter.devis?.id}/pdf`, { responseType: 'blob' });
                                  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                  window.open(url, '_blank');
                                } catch (err) { alert('Erreur PDF'); }
                              }}
                              className="text-xs bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold shadow-sm transition-colors"
                            >
                              Consulter le PDF
                            </button>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleDevisResponse(inter.id, true)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md shadow-emerald-500/20"
                            >
                              ✓ Accepter le devis
                            </button>
                            <button 
                              onClick={() => handleDevisResponse(inter.id, false)}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#1E293B]">
              <HeartPulse className="text-rose-500" /> Carnet de Santé
            </h2>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Dernières Constantes</h3>
              <ul className="space-y-5">
                <li className="flex justify-between items-center pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <TrendingUp size={18} className="text-rose-500" />
                    </div>
                    <span className="text-slate-700 font-medium">Glycémie</span>
                  </div>
                  <span className="text-lg font-bold text-rose-500">1.10 <span className="text-sm font-normal text-slate-400">g/L</span></span>
                </li>
                <li className="flex justify-between items-center pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Activity size={18} className="text-emerald-500" />
                    </div>
                    <span className="text-slate-700 font-medium">Tension</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-500">12/8 <span className="text-sm font-normal text-slate-400">mmHg</span></span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <CreditCard size={18} className="text-blue-500" />
                    </div>
                    <span className="text-slate-700 font-medium">Total dépensé</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{pastInterventions.length * 250} <span className="text-sm font-normal text-slate-400">MAD</span></span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
