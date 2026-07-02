import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, XCircle, MapPin, Camera, ClipboardList, Plus, Trash2, CheckSquare, Calendar, TrendingUp, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';
import SignatureCanvas from 'react-signature-canvas';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import api from '../services/api';

// Fix leaflet icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function InfirmierDashboard() {
  const [activeTab, setActiveTab] = useState('missions');
  const [interventions, setInterventions] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Forms state for en_cours
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [constantes, setConstantes] = useState({ tension: '', glycemie: '', temperature: '', poids: '' });
  const [consommations, setConsommations] = useState([]); // { produit_id, quantite, nom, prix }
  const [paiement, setPaiement] = useState({ methode: 'espece', montant_recu: '' });
  const sigCanvas = useRef({});

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchMissions();
    fetchProduits();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interventions');
      setInterventions(res.data);
      // Auto-set active intervention if any is en_cours
      const enCours = res.data.find(i => i.statut === 'en_cours');
      if (enCours) {
        setActiveIntervention(enCours);
        setActiveTab('active');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    try {
      const res = await api.get('/produits');
      setProduits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const repondreMission = async (id, accepte) => {
    try {
      await api.post(`/interventions/${id}/reponse-infirmier`, { accepte });
      alert(accepte ? "Mission acceptée !" : "Mission refusée.");
      fetchMissions();
    } catch (err) {
      alert("Erreur lors de la réponse.");
    }
  };

  const handleCheckIn = async (mission) => {
    if (!photo) {
      alert("Veuillez prendre une photo pour valider votre arrivée.");
      return;
    }
    const formData = new FormData();
    formData.append('photo', photo);

    try {
      setLoading(true);
      const res = await api.post(`/interventions/${mission.id}/arriver`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Arrivée confirmée ! Vous pouvez commencer les soins.");
      fetchMissions();
    } catch (err) {
      alert("Erreur lors du check-in.");
      console.error(err);
      setLoading(false);
    }
  };

  const addConsommable = (produitId) => {
    if (!produitId) return;
    const prod = produits.find(p => p.id === parseInt(produitId));
    if (!prod) return;
    
    setConsommations(prev => {
      const existing = prev.find(c => c.produit_id === prod.id);
      if (existing) {
        return prev.map(c => c.produit_id === prod.id ? { ...c, quantite: c.quantite + 1 } : c);
      }
      return [...prev, { produit_id: prod.id, quantite: 1, nom: prod.nom, prix: prod.prix_client }];
    });
  };

  const viewPdf = async (url) => {
    try {
      setLoading(true);
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank');
    } catch (err) {
      alert("Erreur lors de l'ouverture du document.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloturer = async () => {
    try {
      if (!sigCanvas.current || (typeof sigCanvas.current.isEmpty === 'function' && sigCanvas.current.isEmpty())) {
        alert("La signature du patient est requise.");
        return;
      }
      
      let signature_patient = null;
      if (sigCanvas.current && typeof sigCanvas.current.getCanvas === 'function') {
        signature_patient = sigCanvas.current.getCanvas().toDataURL('image/png');
      }
      
      const payload = {
        ...constantes,
        notes_infirmier: notes,
        methode_paiement: paiement.methode,
        montant_recu: paiement.montant_recu,
        signature_patient,
        consommations: consommations.map(c => ({ produit_id: c.produit_id, quantite: c.quantite }))
      };

      setLoading(true);
      const res = await api.post(`/interventions/${activeIntervention.id}/cloturer`, payload);
      alert("Intervention clôturée ! Facture générée.");
      setActiveIntervention(null);
      setActiveTab('missions');
      fetchMissions();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        alert("Erreur: " + err.response.data.message + "\n" + JSON.stringify(err.response.data.errors || {}));
      } else {
        alert("Erreur lors de la clôture: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const pendingMissions = interventions.filter(i => i.statut === 'en_attente_reponse_infirmier');
  const upcomingMissions = interventions.filter(i => ['infirmier_accepte', 'devis_genere', 'en_attente_reponse_client', 'acceptee'].includes(i.statut));
  const historiqueMissions = interventions.filter(i => i.statut === 'terminee');
  const consommables = produits.filter(p => p.type === 'consommable');

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 animate-fade-in">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1 text-[#1E293B]">Espace Soignant 👩‍⚕️</h1>
          <p className="text-slate-500">Gérez vos missions et interventions</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500">Nouvelles</span>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Clock size={20} className="text-violet-500" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{pendingMissions.length}</p>
            <p className="text-xs text-slate-400 mt-1">Demandes en attente</p>
          </div>

          <div className="stat-card accent-green">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500">À venir</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Calendar size={20} className="text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{upcomingMissions.length}</p>
            <p className="text-xs text-slate-400 mt-1">Missions planifiées</p>
          </div>

          <div className="stat-card accent-orange">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500">Terminées</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{historiqueMissions.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total missions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('missions')}
            className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${activeTab === 'missions' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Nouvelles demandes {pendingMissions.length > 0 && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{pendingMissions.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${activeTab === 'upcoming' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Missions à venir
          </button>
          <button 
            onClick={() => setActiveTab('historique')}
            className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${activeTab === 'historique' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Historique
          </button>
          {activeIntervention && (
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm flex items-center gap-2 transition-all ${activeTab === 'active' ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CheckSquare size={16} /> Mission En Cours
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div><p className="text-sm text-slate-400">Chargement des missions...</p></div>
        ) : activeTab === 'active' && activeIntervention ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
            <div className="bg-slate-800 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Intervention en cours : {activeIntervention.produit?.nom}</h2>
                <p className="text-slate-300">Patient : {activeIntervention.client?.user?.name}</p>
              </div>
              {activeIntervention.devis && (
                <button 
                  onClick={() => viewPdf(`/devis/${activeIntervention.devis.id}/pdf`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <ClipboardList size={18} /> Voir le Devis
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-8">
              {/* Constantes */}
              <section>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><ClipboardList size={20} /> Constantes Médicales</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tension</label><input type="text" className="w-full p-2 border rounded" value={constantes.tension} onChange={e => setConstantes({...constantes, tension: e.target.value})} placeholder="ex: 12/8" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Glycémie (g/L)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={constantes.glycemie} onChange={e => setConstantes({...constantes, glycemie: e.target.value})} /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Température (°C)</label><input type="number" step="0.1" className="w-full p-2 border rounded" value={constantes.temperature} onChange={e => setConstantes({...constantes, temperature: e.target.value})} /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Poids (kg)</label><input type="number" step="0.1" className="w-full p-2 border rounded" value={constantes.poids} onChange={e => setConstantes({...constantes, poids: e.target.value})} /></div>
                </div>
              </section>

              {/* Notes */}
              <section>
                <h3 className="font-bold text-lg mb-4 text-slate-800">Notes d'intervention</h3>
                <textarea className="w-full p-3 border rounded-lg" rows="3" placeholder="Détails du soin, remarques particulières..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
              </section>

              {/* Consommables */}
              <section>
                <h3 className="font-bold text-lg mb-4 text-slate-800">Consommables Utilisés</h3>
                <div className="flex gap-2 mb-4">
                  <select className="flex-1 p-2 border rounded" id="select-conso">
                    <option value="">Sélectionner un produit...</option>
                    {consommables.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.prix_client} MAD)</option>)}
                  </select>
                  <button onClick={() => addConsommable(document.getElementById('select-conso').value)} className="bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-1"><Plus size={16} /> Ajouter</button>
                </div>
                {consommations.length > 0 && (
                  <ul className="border rounded-lg divide-y">
                    {consommations.map(c => (
                      <li key={c.produit_id} className="p-3 flex justify-between items-center bg-slate-50">
                        <span>{c.nom}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{c.quantite}x</span>
                          <button onClick={() => setConsommations(consommations.filter(x => x.produit_id !== c.produit_id))} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Paiement & Signature */}
              <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-lg mb-4 text-blue-900">Validation et Paiement</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Méthode de Paiement</label>
                    <select className="w-full p-3 border rounded-lg bg-white" value={paiement.methode} onChange={e => setPaiement({...paiement, methode: e.target.value})}>
                      <option value="espece">Espèce</option>
                      <option value="carte">Carte Bancaire (TPE)</option>
                      <option value="virement">Virement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Montant Reçu (MAD)</label>
                    <input type="number" className="w-full p-3 border rounded-lg bg-white" placeholder="ex: 350" value={paiement.montant_recu} onChange={e => setPaiement({...paiement, montant_recu: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Signature du Patient</label>
                  <div className="bg-white border-2 border-dashed border-blue-200 rounded-xl overflow-hidden touch-none">
                    <SignatureCanvas penColor='blue' canvasProps={{className: 'sigCanvas', style: { width: '100%', height: '200px' }}} ref={sigCanvas} />
                  </div>
                  <button onClick={() => sigCanvas.current.clear()} className="text-sm text-slate-500 mt-2 underline">Effacer la signature</button>
                </div>
              </section>
            </div>
            
            <div className="bg-slate-50 p-6 border-t flex justify-end">
              <button onClick={handleCloturer} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                <CheckCircle size={20} /> Clôturer l'intervention
              </button>
            </div>
          </div>

        ) : activeTab === 'missions' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {pendingMissions.length === 0 ? (
              <p className="text-slate-500">Aucune nouvelle demande en attente.</p>
            ) : (
              pendingMissions.map(mission => (
                <div key={mission.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-lg">{mission.produit?.nom}</h3>
                    <span className="status-badge info">Nouvelle</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2"><strong>Patient:</strong> {mission.client?.user?.name}</p>
                  <p className="text-sm text-slate-600 mb-2"><strong>Date demandée:</strong> {new Date(mission.date_heure).toLocaleString('fr-FR')}</p>
                  
                  <div className="mt-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm font-semibold text-slate-700">Indemnité prévue : <span className="text-emerald-600">{mission.produit?.remuneration_soignant || 'À définir'} MAD</span></p>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => repondreMission(mission.id, true)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl flex justify-center gap-2 font-semibold transition-colors shadow-md shadow-emerald-500/20">
                      <CheckCircle size={18} /> Accepter
                    </button>
                    <button onClick={() => repondreMission(mission.id, false)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl flex justify-center gap-2 font-semibold transition-colors">
                      <XCircle size={18} /> Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'upcoming' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingMissions.length === 0 ? (
              <p className="text-slate-500">Aucune mission prévue.</p>
            ) : (
              upcomingMissions.map(mission => (
                <div key={mission.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg">{mission.produit?.nom}</h3>
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {mission.statut === 'acceptee' ? 'Intervention confirmée' : 'En attente patient'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2"><strong>Patient:</strong> {mission.client?.user?.name || 'Client inconnu'}</p>
                    <p className="text-sm text-slate-600 mb-4"><strong>Date:</strong> {new Date(mission.date_heure).toLocaleString('fr-FR')}</p>
                    
                    {/* Carte Leaflet Intégrée */}
                    {mission.localisation?.latitude && mission.localisation?.longitude && (
                      <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-200 mb-4 z-0 relative">
                        <MapContainer center={[mission.localisation.latitude, mission.localisation.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[mission.localisation.latitude, mission.localisation.longitude]}>
                            <Popup>Localisation du patient</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}

                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-sm font-semibold text-slate-700">Votre indemnité : <span className="text-emerald-600">{mission.produit?.remuneration_soignant || 'À définir'} MAD</span></p>
                    </div>
                  </div>

                  {mission.statut === 'acceptee' && (
                    <div className="bg-blue-50 p-4 border-t border-blue-100">
                      <p className="text-sm text-blue-800 font-semibold mb-3">Valider votre arrivée sur place :</p>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                          <Camera size={18} /> Prendre Photo (Selfie)
                          <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
                        </label>
                        <button onClick={() => handleCheckIn(mission)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md">
                          Arrivée
                        </button>
                      </div>
                      {photo && <p className="text-xs text-emerald-600 mt-2">✓ Photo sélectionnée</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'historique' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {historiqueMissions.length === 0 ? (
              <p className="text-slate-500">Aucun historique disponible.</p>
            ) : (
              historiqueMissions.map(mission => (
                <div key={mission.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg">{mission.produit?.nom}</h3>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Terminée</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2"><strong>Patient:</strong> {mission.client?.user?.name}</p>
                    <p className="text-sm text-slate-600 mb-2"><strong>Date:</strong> {new Date(mission.date_heure).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => mission.facture ? viewPdf(`/factures/${mission.facture.id}/pdf`) : alert("Aucune facture trouvée.")}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded flex justify-center gap-2 font-semibold transition-colors"
                    >
                      <ClipboardList size={18} /> Voir la Facture
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
