import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, Download, Printer, Filter, X, Map as MapIcon, Activity, FileText, User, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export default function ClientsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');
  const [detailedClient, setDetailedClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', date_naissance: '',
    latitude: '', longitude: '', adresse: '',
    pays: '', ville: '', code_postal: '', numero_taxe: '', limite_credit: '', notes_internes: '',
    password: '', password_confirmation: ''
  });
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setData(response.data?.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            const addr = data.display_name;
            setAddress(addr);
            setFormData(prev => ({ ...prev, adresse: addr }));
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

  const searchAddress = () => {
    if (!address) return;
    setIsLocating(true);
    setLocationError('');
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            adresse: data[0].display_name
          }));
          setAddress(data[0].display_name);
        } else {
          setLocationError("Adresse introuvable.");
        }
        setIsLocating(false);
      })
      .catch(() => {
        setLocationError("Erreur lors de la recherche de l'adresse.");
        setIsLocating(false);
      });
  };

  const openAddModal = () => {
    setFormData({
      nom: '', prenom: '', email: '', telephone: '', date_naissance: '',
      latitude: '', longitude: '', adresse: '',
      pays: '', ville: '', code_postal: '', numero_taxe: '', limite_credit: '', notes_internes: '',
      password: '', password_confirmation: ''
    });
    setAddress('');
    setEditId(null);
    setDetailedClient(null);
    setActiveTab('infos');
    setShowModal(true);
  };

  const openEditModal = async (client) => {
    const defaultData = {
      nom: client.user?.nom || client.nom || '',
      prenom: client.user?.prenom || '',
      email: client.user?.email || client.email || '',
      telephone: client.telephone || '', 
      date_naissance: client.date_naissance || '',
      latitude: client.latitude || '',
      longitude: client.longitude || '',
      adresse: client.adresse || '',
      pays: client.pays || '', 
      ville: client.ville || '', 
      code_postal: client.code_postal || '', 
      numero_taxe: client.numero_taxe || '', 
      limite_credit: client.limite_credit || '', 
      notes_internes: client.notes_internes || '',
      password: '',
      password_confirmation: ''
    };
    setFormData(defaultData);
    setAddress(client.adresse || '');
    setEditId(client.id);
    setActiveTab('infos');
    setShowModal(true);
    
    try {
      const res = await api.get(`/clients/${client.id}`);
      setDetailedClient(res.data);
      setFormData({
        ...defaultData,
        nom: res.data.user?.nom || '',
        prenom: res.data.user?.prenom || '',
        email: res.data.user?.email || '',
        date_naissance: res.data.date_naissance || '',
        latitude: res.data.latitude || '',
        longitude: res.data.longitude || '',
        adresse: res.data.adresse || '',
        pays: res.data.pays || '',
        ville: res.data.ville || '',
        code_postal: res.data.code_postal || '',
        numero_taxe: res.data.numero_taxe || '',
        limite_credit: res.data.limite_credit || '',
        notes_internes: res.data.notes_internes || ''
      });
      setAddress(res.data.adresse || '');
    } catch (e) {
      console.error(e);
    }
  };

  const saveClient = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.password_confirmation) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        adresse: address
      };
      if (editId) {
        await api.put(`/clients/${editId}`, payload);
      } else {
        await api.post('/clients', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      let errorMsg = "Erreur lors de l'enregistrement";
      if (error.response?.data?.message) {
        errorMsg += ": " + error.response.data.message;
      }
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.nom?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (item.code_client?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.telephone || '').includes(search)
  );

  return (
    <div className="erp-page">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Clients</h1>
          <p className="erp-page-subtitle">Gérez vos clients et leurs informations de facturation.</p>
        </div>
        <div className="erp-page-actions">
          <button className="erp-btn-secondary"><Printer size={16}/> Imprimer</button>
          <button className="erp-btn-secondary"><Download size={16}/> Exporter CSV</button>
          <button className="erp-btn-primary" onClick={openAddModal}>
            <Plus size={16}/> Ajouter un Client
          </button>
        </div>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, code ou téléphone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="erp-btn-secondary"><Filter size={16}/> Filtres</button>
        </div>

        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Contact</th>
                <th>Localisation</th>
                <th>N° Taxe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Chargement...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted">Aucun client trouvé.</td></tr>
              ) : (
                filteredData.map((client) => (
                  <tr key={client.id}>
                    <td className="font-medium text-blue-400">{client.code_client}</td>
                    <td className="font-semibold">{client.nom}</td>
                    <td>
                      <div>{client.telephone || '-'}</div>
                      <div className="text-xs text-gray-400">{client.email || '-'}</div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {client.adresse ? client.adresse : 
                         (client.ville ? `${client.ville}, ${client.pays}` : '-')}
                      </div>
                      {client.latitude && (
                        <a 
                          href={`https://www.google.com/maps?q=${client.latitude},${client.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1 font-medium"
                        >
                          📌 Voir sur la carte
                        </a>
                      )}
                    </td>
                    <td>{client.numero_taxe || '-'}</td>
                    <td className="erp-table-actions">
                      <button onClick={() => openEditModal(client)} className="erp-action-btn edit" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => deleteClient(client.id)} className="erp-action-btn delete" title="Supprimer"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT/MODIFICATION */}
      {showModal && (
        <div className="erp-modal-overlay" style={{ zIndex: 9999, padding: '2rem' }}>
          <div className="erp-modal" style={{ width: '900px', maxWidth: '95vw' }}>
            <div className="erp-modal-header" style={{ paddingBottom: '0' }}>
              <div className="flex justify-between items-center w-full mb-4">
                <h2 className="text-xl font-bold">{editId ? `Dossier Client : ${formData.nom}` : 'Nouveau Client'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-200"><X size={20} /></button>
              </div>
              
              {/* Tabs */}
              {editId && (
                <div className="flex gap-4 border-b border-slate-700/50 w-full mt-2">
                  <button 
                    onClick={() => setActiveTab('infos')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'infos' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    <User size={16} /> Informations
                  </button>
                  <button 
                    onClick={() => setActiveTab('localisation')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'localisation' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    <Map size={16} /> Localisation
                  </button>
                  <button 
                    onClick={() => setActiveTab('interventions')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'interventions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    <FileText size={16} /> Historique Soins
                  </button>
                  <button 
                    onClick={() => setActiveTab('carnet')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'carnet' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    <Activity size={16} /> Carnet de Santé
                  </button>
                </div>
              )}
            </div>
            
            <div className="erp-modal-body p-6">
              {/* TAB 1: INFORMATIONS */}
              {activeTab === 'infos' && (
                <form onSubmit={saveClient}>
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider pb-1 border-b border-slate-700/40">Informations Personnelles</h3>
                  <div className="erp-form-grid mb-6">
                    <div className="erp-form-group">
                      <label>Nom *</label>
                      <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} placeholder="Nom de famille" />
                    </div>
                    <div className="erp-form-group">
                      <label>Prénom</label>
                      <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} placeholder="Prénom" />
                    </div>
                    <div className="erp-form-group">
                      <label>Date de Naissance</label>
                      <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleInputChange} />
                    </div>
                    <div className="erp-form-group">
                      <label>Téléphone</label>
                      <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="Ex: +212 600 000 000" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider pb-1 border-b border-slate-700/40">Identifiants de Connexion</h3>
                  <div className="erp-form-grid mb-6">
                    <div className="erp-form-group">
                      <label>Email *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="votre@email.com" />
                    </div>
                    <div className="erp-form-group">
                      <label>Mot de passe {editId ? '(Laisser vide si inchangé)' : '*'}</label>
                      <input type="password" name="password" required={!editId} value={formData.password} onChange={handleInputChange} placeholder="••••••" />
                    </div>
                    <div className="erp-form-group">
                      <label>Confirmer le mot de passe {editId ? '(Laisser vide si inchangé)' : '*'}</label>
                      <input type="password" name="password_confirmation" required={!editId} value={formData.password_confirmation} onChange={handleInputChange} placeholder="••••••" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider pb-1 border-b border-slate-700/40">Adresse & Position GPS</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          style={{ paddingLeft: '2.5rem' }}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none py-2"
                          placeholder="Rechercher une adresse sur OpenStreetMap..." 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin size={16} />
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={searchAddress}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        <Search size={16} /> Rechercher
                      </button>
                    </div>

                    <button 
                      type="button" 
                      onClick={detectLocation}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                        formData.latitude 
                          ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-500/30'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      <MapIcon size={16} /> {isLocating ? 'Géolocalisation...' : (formData.latitude ? 'Actualiser ma position GPS' : 'Me géolocaliser automatiquement')}
                    </button>

                    <div className="h-60 w-full rounded-lg overflow-hidden border border-slate-700 relative">
                      {!formData.latitude && (
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[400] flex items-center justify-center pointer-events-none">
                          <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm text-sm">
                            Veuillez chercher une adresse ou vous géolocaliser
                          </span>
                        </div>
                      )}
                      <MapContainer center={formData.latitude ? [formData.latitude, formData.longitude] : [33.5731, -7.5898]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={formData.latitude ? [formData.latitude, formData.longitude] : [33.5731, -7.5898]} />
                        {formData.latitude && (
                          <Marker position={[formData.latitude, formData.longitude]}>
                            <Popup>Adresse du client</Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    </div>
                    {locationError && <p className="text-red-400 text-xs font-semibold">{locationError}</p>}
                  </div>

                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider pb-1 border-b border-slate-700/40">Détails de Facturation & Client</h3>
                  <div className="erp-form-grid mb-4">
                    <div className="erp-form-group">
                      <label>Numéro de Taxe / RC</label>
                      <input type="text" name="numero_taxe" value={formData.numero_taxe} onChange={handleInputChange} placeholder="Ex: 00154875" />
                    </div>
                    <div className="erp-form-group">
                      <label>Pays</label>
                      <input type="text" name="pays" value={formData.pays} onChange={handleInputChange} placeholder="Maroc" />
                    </div>
                    <div className="erp-form-group">
                      <label>Ville</label>
                      <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} placeholder="Casablanca" />
                    </div>
                    <div className="erp-form-group">
                      <label>Code Postal</label>
                      <input type="text" name="code_postal" value={formData.code_postal} onChange={handleInputChange} placeholder="20000" />
                    </div>
                    <div className="erp-form-group">
                      <label>Limite de Crédit</label>
                      <input type="number" step="0.01" name="limite_credit" value={formData.limite_credit} onChange={handleInputChange} placeholder="0.00" />
                    </div>
                  </div>
                  
                  <div className="erp-form-group full-width mt-4">
                    <label>Notes Internes / Antécédents Médicaux</label>
                    <textarea name="notes_internes" rows="3" value={formData.notes_internes} onChange={handleInputChange} placeholder="Notes importantes, antécédents médicaux..."></textarea>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="erp-btn-secondary">Annuler</button>
                    <button type="submit" disabled={isSaving} className="erp-btn-primary">
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: LOCALISATION */}
              {activeTab === 'localisation' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
                    <p><strong>Adresse complète :</strong> {detailedClient?.adresse || 'Non renseignée'}</p>
                    <p><strong>Ville :</strong> {detailedClient?.ville || 'Non renseignée'}, {detailedClient?.pays}</p>
                  </div>
                  {detailedClient?.latitude && detailedClient?.longitude ? (
                    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #475569' }}>
                      <MapContainer center={[detailedClient.latitude, detailedClient.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[detailedClient.latitude, detailedClient.longitude]}>
                          <Popup>Domicile de {detailedClient.nom}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-600 text-slate-400">
                      <Map size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Aucune coordonnée GPS enregistrée pour ce client.</p>
                      <p className="text-sm mt-1">Le client doit configurer son adresse exacte depuis son application mobile ou vous devez mettre à jour ses coordonnées.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INTERVENTIONS */}
              {activeTab === 'interventions' && (
                <div className="overflow-x-auto">
                  {!detailedClient ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                  ) : !detailedClient.interventions || detailedClient.interventions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-600 text-slate-400">
                      <FileText size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Aucune intervention passée pour ce client.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/60 bg-slate-800/50">
                          <th className="p-3 font-semibold text-slate-300">Date & Heure</th>
                          <th className="p-3 font-semibold text-slate-300">Soin / Produit</th>
                          <th className="p-3 font-semibold text-slate-300">Infirmier</th>
                          <th className="p-3 font-semibold text-slate-300">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {detailedClient.interventions.map((intv) => (
                          <tr key={intv.id} className="hover:bg-slate-800/30">
                            <td className="p-3">{new Date(intv.date_heure).toLocaleString('fr-FR')}</td>
                            <td className="p-3 text-blue-400 font-medium">{intv.produit?.nom || 'Soin'}</td>
                            <td className="p-3">{intv.infirmier?.user ? `${intv.infirmier.user.nom} ${intv.infirmier.user.prenom || ''}` : '-'}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-700 text-slate-300">
                                {intv.statut.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* TAB 4: CARNET DE SANTE */}
              {activeTab === 'carnet' && (
                <div>
                  <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-200">
                    <h3 className="font-bold flex items-center gap-2"><Activity size={18} /> Carnet de Santé Virtuel</h3>
                    <p className="text-sm mt-1 opacity-80">Ce carnet regroupe automatiquement les constantes médicales relevées par les infirmiers lors des précédentes interventions à domicile.</p>
                  </div>
                  
                  <div className="overflow-x-auto mt-4">
                    {!detailedClient ? (
                      <div className="p-8 text-center text-slate-500">Chargement...</div>
                    ) : !detailedClient.interventions || !detailedClient.interventions.some(i => i.constantes && i.constantes.length > 0) ? (
                      <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-600 text-slate-400">
                        <Activity size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Aucune constante médicale relevée pour l'instant.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {detailedClient.interventions.filter(i => i.constantes && i.constantes.length > 0).map(intv => (
                          <div key={intv.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700/50">
                              <span className="font-semibold text-slate-200">Relevé du {new Date(intv.date_heure).toLocaleDateString('fr-FR')}</span>
                              <span className="text-xs text-slate-400">Par: {intv.infirmier?.user?.nom || 'Inconnu'}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {intv.constantes.map(c => (
                                <React.Fragment key={c.id}>
                                  {c.tension && (
                                    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-slate-400 mb-1">Tension</p>
                                      <p className="font-bold text-emerald-400">{c.tension}</p>
                                    </div>
                                  )}
                                  {c.glycemie && (
                                    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-slate-400 mb-1">Glycémie</p>
                                      <p className="font-bold text-amber-400">{c.glycemie}</p>
                                    </div>
                                  )}
                                  {c.temperature && (
                                    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-slate-400 mb-1">Température</p>
                                      <p className="font-bold text-red-400">{c.temperature} °C</p>
                                    </div>
                                  )}
                                  {c.poids && (
                                    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-slate-400 mb-1">Poids</p>
                                      <p className="font-bold text-blue-400">{c.poids} kg</p>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
