import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Search, MapPin, Map, CheckCircle, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import api from '../../services/api';

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

function MapClickListener({ formData, setFormData, setAddress, setIsLocating, setLocationError }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      
      setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
      
      // Reverse geocoding
      setIsLocating(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(d => { 
          if (d && d.display_name) {
            setAddress(d.display_name); 
          }
          setIsLocating(false); 
        })
        .catch(() => {
          setLocationError("Impossible de trouver l'adresse pour cette position.");
          setIsLocating(false);
        });
    },
  });

  return formData.latitude ? (
    <Marker position={[formData.latitude, formData.longitude]}>
      <Popup>Domicile Infirmier</Popup>
    </Marker>
  ) : null;
}

export default function UtilisateursList() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const initialForm = {
    nom: '', prenom: '', email: '', password: '', role: '',
    cin: '', telephone_infirmier: '', specialite: 'Polyvalent',
    type_contrat: 'salarie', latitude: '', longitude: '',
    photo_cin_recto: null, photo_cin_verso: null, photo_diplome: null
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    fetchData();
    fetchRoles();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/users');
      setData(response.data?.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : '';
      setFormData({
        ...initialForm,
        nom: user.nom,
        prenom: user.prenom || '',
        email: user.email,
        password: '',
        role: roleName
      });
      // Not populating all infirmier details on edit for simplicity in UI unless we fetch full profile
      // If we had full profile loaded, we would set it here.
    } else {
      setCurrentUser(null);
      setFormData(initialForm);
      setAddress('');
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  // --- Geolocation Logic ---
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
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(d => { setAddress(d.display_name); setIsLocating(false); })
          .catch(() => setIsLocating(false));
      },
      (error) => {
        setLocationError("Impossible d'obtenir votre position.");
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
      .then(d => {
        if (d && d.length > 0) {
          setFormData(prev => ({ ...prev, latitude: parseFloat(d[0].lat), longitude: parseFloat(d[0].lon) }));
          setAddress(d[0].display_name);
        } else {
          setLocationError("Adresse introuvable.");
        }
        setIsLocating(false);
      })
      .catch(() => { setLocationError("Erreur lors de la recherche."); setIsLocating(false); });
  };

  const defaultCenter = formData.latitude ? [formData.latitude, formData.longitude] : [33.5731, -7.5898];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isInfirmier = formData.role === 'infirmier';
      let payload;
      let headers = {};

      if (isInfirmier) {
        payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== '') {
            payload.append(key, formData[key]);
          }
        });
        if (address) payload.append('adresse_residence', address);
        headers = { 'Content-Type': 'multipart/form-data' };
        if (!payload.has('password') && !currentUser) {
            alert('Mot de passe obligatoire');
            return;
        }
      } else {
        payload = { ...formData };
        if (!payload.password) delete payload.password;
      }

      if (currentUser) {
        if (isInfirmier && payload instanceof FormData) {
            payload.append('_method', 'PUT'); // Laravel workaround for multipart PUT
            await api.post(`/users/${currentUser.id}`, payload, { headers });
        } else {
            await api.put(`/users/${currentUser.id}`, payload);
        }
      } else {
        await api.post('/users', payload, { headers });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      let errStr = "Erreur lors de l'enregistrement.\n";
      if(error.response?.data?.errors) {
         errStr += JSON.stringify(error.response.data.errors, null, 2);
      }
      alert(errStr);
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const filteredData = data.filter(item => 
    item.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Gestion des Utilisateurs</h1>
          <p className="text-muted text-sm mt-1">Créez et gérez les accès de votre équipe.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Ajouter Utilisateur
        </button>
      </header>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.5rem 1rem', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: '#f8fafc' }}>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nom Complet</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rôle</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: '500', color: '#1e293b' }}>{item.prenom} {item.nom}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{item.email}</td>
                    <td style={{ padding: '1rem' }}>
                      {item.roles && item.roles.length > 0 ? (
                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
                          {item.roles.map(r => { const n = r.name || r; return n === 'gestionnaire' ? 'admin' : n; }).join(', ')}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Aucun rôle</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => { setViewUser(item); setIsViewModalOpen(true); }} style={{ color: '#0ea5e9', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} title="Voir les détails">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleOpenModal(item)} style={{ color: 'var(--primary-color)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} title="Modifier">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }} title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Utilisateur */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: formData.role === 'infirmier' ? '900px' : '450px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', margin: 'auto', marginTop: '5vh' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#1e293b' }}>{currentUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: formData.role === 'infirmier' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                {/* Champs Communs */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Nom</label>
                  <input type="text" name="nom" className="glass-input" required value={formData.nom} onChange={handleInputChange} style={{ color: '#1e293b' }} />
                </div>
                
                {formData.role === 'infirmier' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Prénom</label>
                    <input type="text" name="prenom" className="glass-input" required value={formData.prenom} onChange={handleInputChange} style={{ color: '#1e293b' }} />
                  </div>
                )}
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Adresse Email</label>
                  <input type="email" name="email" className="glass-input" required value={formData.email} onChange={handleInputChange} style={{ color: '#1e293b' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Mot de passe {currentUser && '(Optionnel)'}</label>
                  <input type="password" name="password" className="glass-input" required={!currentUser} value={formData.password} onChange={handleInputChange} minLength="6" style={{ color: '#1e293b' }} />
                </div>
                
                <div style={{ gridColumn: formData.role === 'infirmier' ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Rôle</label>
                  <select name="role" className="glass-input" required value={formData.role} onChange={handleInputChange} style={{ appearance: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: 'bold' }}>
                    <option value="">-- Sélectionner un rôle --</option>
                    {roles.map(role => (
                      <option key={role.id || role} value={role.name || role}>{(role.name || role) === 'gestionnaire' ? 'admin' : (role.name || role)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Champs Spécifiques Infirmier */}
              {formData.role === 'infirmier' && (
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1rem', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 'bold' }}>Informations Infirmier</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Numéro CIN</label>
                      <input type="text" name="cin" className="glass-input" required={!currentUser} value={formData.cin} onChange={handleInputChange} style={{ color: '#1e293b' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Téléphone</label>
                      <input type="tel" name="telephone_infirmier" className="glass-input" required={!currentUser} value={formData.telephone_infirmier} onChange={handleInputChange} style={{ color: '#1e293b' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Spécialité</label>
                      <select name="specialite" className="glass-input" required value={formData.specialite} onChange={handleInputChange} style={{ color: '#1e293b' }}>
                        <option value="Polyvalent">Polyvalent</option>
                        <option value="Soins généraux">Soins généraux</option>
                        <option value="Garde-malade">Garde-malade</option>
                        <option value="Pédiatrie">Pédiatrie</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Type de contrat</label>
                      <select name="type_contrat" className="glass-input" required value={formData.type_contrat} onChange={handleInputChange} style={{ color: '#1e293b' }}>
                        <option value="salarie">Salarié(e)</option>
                        <option value="par_acte">Par acte (Freelance)</option>
                        <option value="les_deux">Les deux</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Photo CIN (Recto)</label>
                      <input type="file" name="photo_cin_recto" accept="image/*" onChange={handleFileChange} className="glass-input" required={!currentUser} style={{ color: '#1e293b', padding: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Photo CIN (Verso)</label>
                      <input type="file" name="photo_cin_verso" accept="image/*" onChange={handleFileChange} className="glass-input" required={!currentUser} style={{ color: '#1e293b', padding: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>Photo Diplôme</label>
                      <input type="file" name="photo_diplome" accept="image/*" onChange={handleFileChange} className="glass-input" required={!currentUser} style={{ color: '#1e293b', padding: '6px' }} />
                    </div>
                  </div>

                  {/* Geolocation Map */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      <span>Adresse & Position GPS</span>
                      {formData.latitude && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Localisé</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="glass-input"
                        placeholder="Rechercher une adresse..." 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                        style={{ color: '#1e293b' }}
                      />
                      <button type="button" onClick={searchAddress} style={{ background: '#3b82f6', color: 'white', padding: '0 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                        <Search size={18} />
                      </button>
                    </div>
                    <button 
                      type="button" 
                      onClick={detectLocation}
                      style={{ width: '100%', padding: '10px', background: formData.latitude ? '#ecfdf5' : '#1e293b', color: formData.latitude ? '#059669' : 'white', border: formData.latitude ? '1px solid #a7f3d0' : 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}
                    >
                      <Map size={18} /> {isLocating ? 'Recherche...' : 'Me géolocaliser automatiquement'}
                    </button>
                    <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
                      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={defaultCenter} />
                        <MapClickListener 
                          formData={formData} 
                          setFormData={setFormData} 
                          setAddress={setAddress} 
                          setIsLocating={setIsLocating} 
                          setLocationError={setLocationError} 
                        />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 20px', borderRadius: '8px' }}>Annuler</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', width: 'auto' }}>
                  {currentUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Details */}
      {isViewModalOpen && viewUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: viewUser.role === 'infirmier' ? '800px' : '450px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', margin: 'auto', marginTop: '5vh' }}>
            <button onClick={() => setIsViewModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#1e293b' }}>Détails de l'utilisateur</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#1e293b' }}>
              <p><strong>Nom Complet:</strong> {viewUser.prenom} {viewUser.nom}</p>
              <p><strong>Email:</strong> {viewUser.email}</p>
              <p><strong>Rôle:</strong> {viewUser.role === 'gestionnaire' ? 'admin' : viewUser.role}</p>

              {viewUser.role === 'infirmier' && viewUser.infirmier && (
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1rem', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 'bold' }}>Profil Infirmier</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <p><strong>CIN:</strong> {viewUser.infirmier.cin}</p>
                    <p><strong>Téléphone:</strong> {viewUser.infirmier.telephone}</p>
                    <p><strong>Spécialité:</strong> {viewUser.infirmier.specialite}</p>
                    <p><strong>Contrat:</strong> {viewUser.infirmier.type_contrat}</p>
                  </div>

                  <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Documents</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>CIN Recto</p>
                      {viewUser.infirmier.photo_cin_recto ? (
                        <a href={`http://127.0.0.1:8000/storage/${viewUser.infirmier.photo_cin_recto}`} target="_blank" rel="noreferrer">
                          <img src={`http://127.0.0.1:8000/storage/${viewUser.infirmier.photo_cin_recto}`} alt="CIN Recto" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </a>
                      ) : <span style={{ color: '#94a3b8' }}>Non fourni</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>CIN Verso</p>
                      {viewUser.infirmier.photo_cin_verso ? (
                        <a href={`http://127.0.0.1:8000/storage/${viewUser.infirmier.photo_cin_verso}`} target="_blank" rel="noreferrer">
                          <img src={`http://127.0.0.1:8000/storage/${viewUser.infirmier.photo_cin_verso}`} alt="CIN Verso" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </a>
                      ) : <span style={{ color: '#94a3b8' }}>Non fourni</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Diplôme</p>
                      {viewUser.infirmier.photo_diplome ? (
                        <a href={`http://127.0.0.1:8000/storage/${viewUser.infirmier.photo_diplome}`} target="_blank" rel="noreferrer">
                          <img src={`http://127.0.0.1:8000/storage/${viewUser.infirmier.photo_diplome}`} alt="Diplôme" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </a>
                      ) : <span style={{ color: '#94a3b8' }}>Non fourni</span>}
                    </div>
                  </div>

                  {viewUser.infirmier.latitude && (
                    <div>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Localisation</h4>
                      <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#475569' }}>{viewUser.infirmier.adresse_residence}</p>
                      <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        <MapContainer center={[viewUser.infirmier.latitude, viewUser.infirmier.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[viewUser.infirmier.latitude, viewUser.infirmier.longitude]}>
                            <Popup>Domicile</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
