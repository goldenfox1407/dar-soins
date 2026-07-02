import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { LogOut, Activity, Calendar, Clock, MapPin, CheckCircle, FileText, Syringe, HeartPulse, UploadCloud, Map } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 animate-fade-in">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-[#1E293B]">Bonjour, {user?.name?.split(' ')[0] || 'Patient'} 👋</h1>
            <p className="text-slate-600">Gérez vos soins et suivez votre santé en temps réel.</p>
          </div>
          <button 
            onClick={() => setShowOrderForm(!showOrderForm)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            {showOrderForm ? 'Annuler la demande' : '+ Demander un soin'}
          </button>
        </header>

        {showOrderForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 mb-8 animate-fade-in shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#1E293B]">
              <Syringe className="text-blue-600" /> Nouvelle demande d'intervention
            </h2>
            <form onSubmit={handleOrderSubmit} className="grid md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Soin Requis</label>
                <select 
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
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
                <label className="text-sm font-medium text-slate-700">Date et Heure souhaitées</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  value={formData.date_heure}
                  onChange={e => setFormData({...formData, date_heure: e.target.value})}
                />
              </div>

              {/* Localisation via GPS */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                  <span>Votre Position Actuelle (GPS)</span>
                  {formData.latitude && <span className="text-emerald-600 text-xs flex items-center gap-1"><CheckCircle size={14}/> Localisé avec succès</span>}
                </label>
                <div className="flex flex-col gap-4">
                  <button 
                    type="button" 
                    onClick={detectLocation}
                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-3 rounded-md transition-colors font-medium"
                  >
                    <Map size={18} /> {isLocating ? 'Recherche en cours...' : 'Me géolocaliser'}
                  </button>
                  {address && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md px-4 py-3 text-slate-700 text-sm">
                      <span className="font-semibold text-blue-700 block mb-1">Adresse approximative :</span>
                      {address}
                    </div>
                  )}
                  {formData.latitude && (
                    <div className="h-48 w-full rounded-md overflow-hidden border border-slate-300 shadow-sm">
                      <MapContainer center={[formData.latitude, formData.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[formData.latitude, formData.longitude]}>
                          <Popup>Votre position</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                </div>
                {locationError && <p className="text-red-400 text-xs mt-1">{locationError}</p>}
              </div>

              {/* Description & Photo */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">Description du problème (Optionnel)</label>
                <textarea 
                  rows="3"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none resize-none transition-all"
                  placeholder="Décrivez vos symptômes ou les détails du soin dont vous avez besoin afin d'aider notre équipe..."
                  value={formData.details}
                  onChange={e => setFormData({...formData, details: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">Joindre une photo ou une ordonnance (Optionnel)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-md p-4 transition-colors flex items-center justify-center gap-4 relative">
                  <UploadCloud className="text-slate-400" size={24} />
                  <span className="text-sm text-slate-600">{formData.fichier ? formData.fichier.name : 'Cliquez pour uploader un fichier (Max 5MB)'}</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={e => setFormData({...formData, fichier: e.target.files[0]})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.latitude}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Confirmer la demande et Trouver un infirmier'}
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">Toute demande sera évaluée par notre gestionnaire médical pour validation.</p>
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
              <div className="text-center py-8 text-slate-500">Chargement...</div>
            ) : activeInterventions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
                Vous n'avez aucun soin prévu actuellement.
              </div>
            ) : (
              <div className="space-y-4">
                {activeInterventions.map(inter => (
                  <div key={inter.id} className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold mb-2 inline-block">
                          {inter.statut === 'en_attente' ? 'En attente d\'infirmier' : 'En route / En cours'}
                        </span>
                        <h3 className="text-lg font-bold text-[#1E293B]">{inter.produit?.nom || 'Soin Infirmier'}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{new Date(inter.date_heure).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                        <div className="text-xs text-slate-500">{new Date(inter.date_heure).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-md p-4 flex items-center gap-4 border border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <Activity className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Statut</p>
                        <p className="font-semibold text-slate-800">
                          {inter.statut === 'en_attente_affectation' && 'En attente d\'affectation d\'un infirmier'}
                          {inter.statut === 'en_attente_reponse_infirmier' && 'En attente de confirmation du soignant'}
                          {inter.statut === 'infirmier_accepte' && 'Soignant confirmé. Devis en préparation.'}
                          {inter.statut === 'devis_genere' && 'Devis prêt. Envoi imminent.'}
                          {inter.statut === 'en_attente_reponse_client' && 'Action requise : Devis en attente d\'acceptation'}
                          {inter.statut === 'acceptee' && 'Confirmée, intervention planifiée'}
                        </p>
                      </div>
                    </div>
                    
                    {inter.statut === 'en_attente_reponse_client' && (
                      <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
                          <span className="text-sm font-semibold text-blue-800 flex items-center gap-2"><FileText size={16}/> Devis de la prestation</span>
                          <button 
                            onClick={async () => {
                              try {
                                const response = await api.get(`/devis/${inter.devis?.id}/pdf`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                window.open(url, '_blank');
                              } catch (err) { alert('Erreur PDF'); }
                            }}
                            className="text-xs bg-white border border-blue-200 text-blue-600 hover:bg-blue-60 px-3 py-1.5 rounded font-bold shadow-sm"
                          >
                            Consulter le PDF
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleDevisResponse(inter.id, true)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-semibold text-sm transition-colors"
                          >
                            Accepter le devis
                          </button>
                          <button 
                            onClick={() => handleDevisResponse(inter.id, false)}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-md font-semibold text-sm transition-colors"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#1E293B]">
              <HeartPulse className="text-rose-500" /> Carnet de Santé
            </h2>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Dernières Constantes</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-slate-700 font-medium">Glycémie</span>
                  </div>
                  <span className="text-lg font-bold text-rose-500">1.10 <span className="text-sm font-normal text-slate-500">g/L</span></span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-700 font-medium">Tension</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-500">12/8 <span className="text-sm font-normal text-slate-500">mmHg</span></span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
