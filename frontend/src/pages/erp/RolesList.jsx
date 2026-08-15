import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Shield } from 'lucide-react';
import api from '../../services/api';

const MODULES_LIST = [
  { id: 'tableau_de_bord', label: 'Tableau de bord' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'utilisateurs', label: 'Utilisateurs' },
  { id: 'roles', label: 'Rôles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'produits', label: 'Produits' },
  { id: 'stocks', label: 'Gestion des Stocks' },
  { id: 'achats', label: 'Achats' },
  { id: 'ventes', label: 'Ventes' },
  { id: 'devis', label: 'Devis' },
  { id: 'rh', label: 'Ressources Humaines' },
  { id: 'services', label: 'Services & Contrats' },
  { id: 'taches', label: 'Organisation / Tâches' },
  { id: 'rapports', label: 'Rapports' },
  { id: 'parametres', label: 'Paramètres système' }
];

const ACTIONS = [
  { id: 'voir', label: 'Voir' },
  { id: 'ajouter', label: 'Ajouter' },
  { id: 'modifier', label: 'Modifier' },
  { id: 'supprimer', label: 'Supprimer' }
];

export default function RolesList() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', permissions: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ]);
      setRoles(rolesRes.data?.data || rolesRes.data || []);
      setAllPermissions(permsRes.data?.data || permsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setCurrentRole(role);
      setFormData({
        name: role.name,
        permissions: role.permissions ? role.permissions.map(p => p.name) : []
      });
    } else {
      setCurrentRole(null);
      setFormData({ name: '', permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (permissionName) => {
    setFormData(prev => {
      const perms = new Set(prev.permissions);
      if (perms.has(permissionName)) {
        perms.delete(permissionName);
      } else {
        perms.add(permissionName);
      }
      return { ...prev, permissions: Array.from(perms) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRole) {
        await api.put(`/roles/${currentRole.id}`, formData);
      } else {
        await api.post('/roles', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Erreur lors de l'enregistrement du rôle.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? (Impossible de supprimer les rôles système)')) {
      try {
        await api.delete(`/roles/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  // Helper pour vérifier si une permission existe dans la BDD (ex: certains modules n'ont peut-être pas "supprimer")
  const permissionExists = (permName) => {
    return allPermissions.some(p => p.name === permName);
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Gestion des Rôles</h1>
          <p className="text-muted text-sm mt-1">Définissez les profils et leurs permissions exactes (Clone Stocky).</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Nouveau Rôle
        </button>
      </header>

      {loading ? (
        <div className="text-center p-8 text-muted">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: '#f8fafc' }}>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nom du Rôle</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Permissions Assignées</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun rôle trouvé.</td>
                </tr>
              ) : (
                roles.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', textTransform: 'capitalize', color: '#1e293b' }}>{(item.name === 'gestionnaire') ? 'admin' : item.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.permissions && item.permissions.length > 0 ? (
                          item.permissions.length > 8 ? (
                            <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '500' }}>{item.permissions.length} permissions accordées</span>
                          ) : (
                            item.permissions.map(p => (
                              <span key={p.id} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569' }}>
                                {p.name}
                              </span>
                            ))
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune permission</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleOpenModal(item)} style={{ color: 'var(--primary-color)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
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

      {/* Modal Rôle & Permissions (Matrice) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '900px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', position: 'relative', margin: 'auto', marginTop: '10vh', color: '#1e293b' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#1e293b' }}>{currentRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Nom du rôle</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value.toLowerCase()})} 
                  placeholder="ex: caissier, superviseur..."
                  disabled={currentRole && ['gestionnaire', 'infirmier', 'client'].includes(currentRole.name)}
                />
                {currentRole && ['gestionnaire', 'infirmier', 'client'].includes(currentRole.name) && (
                  <small style={{ color: '#f59e0b', display: 'block', marginTop: '4px' }}>Le nom de ce rôle système ne peut pas être modifié.</small>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  Matrice des Permissions
                </h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px', color: '#475569' }}>Module</th>
                      {ACTIONS.map(a => (
                        <th key={a.id} style={{ textAlign: 'center', padding: '10px', color: '#475569' }}>{a.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES_LIST.map((mod, idx) => (
                      <tr key={mod.id} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'transparent' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '500', color: '#1e293b', borderTop: '1px solid #e2e8f0' }}>
                          {mod.label}
                        </td>
                        {ACTIONS.map(action => {
                          const permName = `${action.id}_${mod.id}`;
                          const isAvailable = permissionExists(permName);
                          const isChecked = formData.permissions.includes(permName);
                          
                          return (
                            <td key={action.id} style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                              {isAvailable ? (
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => handleCheckboxChange(permName)}
                                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                                />
                              ) : (
                                <span style={{ color: '#475569' }}>-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 20px', borderRadius: '8px' }}>Annuler</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                  {currentRole ? 'Mettre à jour' : 'Créer le rôle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
