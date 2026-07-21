import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { X, Map, FileText, Send, UserCheck, AlertCircle, Calendar, User, Package, Coins } from 'lucide-react';
import api from '../../services/api';

export default function VenteDetailsModal({ intervention, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [selectedInfirmier, setSelectedInfirmier] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [distanceManuelle, setDistanceManuelle] = useState('');
  const [tarifKmManuel, setTarifKmManuel] = useState(2.5);

  useEffect(() => {
    if (mapData && selectedInfirmier) {
      const inf = mapData.infirmiers.find(i => i.id === selectedInfirmier);
      if (inf) setDistanceManuelle(inf.distance_km);
    }
  }, [mapData, selectedInfirmier]);

  useEffect(() => {
    if (intervention.statut === 'en_attente_affectation') {
      fetchMapData();
    }
  }, [intervention]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/interventions/${intervention.id}/infirmiers-proches`);
      setMapData(res.data);
      if (res.data.infirmiers.length > 0) {
        setSelectedInfirmier(res.data.infirmiers[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const affecterManuellement = async () => {
    if (!selectedInfirmier) return alert('Sélectionnez un infirmier');
    setActionLoading(true);
    try {
      await api.post(`/interventions/${intervention.id}/affecter-manuellement`, { 
        infirmier_id: selectedInfirmier,
        distance_manuelle: distanceManuelle,
        tarif_km_manuel: tarifKmManuel
      });
      alert('Infirmier affecté ! En attente de sa réponse.');
      onRefresh();
      onClose();
    } catch (err) {
      alert('Erreur lors de l\'affectation');
    } finally {
      setActionLoading(false);
    }
  };

  const genererDevis = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/interventions/${intervention.id}/generer-devis`);
      alert(res.data.message);
      onRefresh();
      onClose();
    } catch (err) {
      alert('Erreur génération devis');
    } finally {
      setActionLoading(false);
    }
  };

  const envoyerDevis = async () => {
    setActionLoading(true);
    try {
      await api.post(`/interventions/${intervention.id}/envoyer-devis`);
      alert('Devis envoyé au client par email.');
      onRefresh();
      onClose();
    } catch (err) {
      alert('Erreur envoi devis');
    } finally {
      setActionLoading(false);
    }
  };

  const consulterDocument = async (type, id) => {
    try {
      const endpoint = type === 'facture' ? `/factures/${id}/pdf` : `/devis/${id}/pdf`;
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      alert(`Erreur lors de la récupération du ${type} (PDF).`);
    }
  };

  return (
    <div className="erp-modal-overlay" style={{ zIndex: 9999, padding: '2rem' }}>
      <div className="erp-modal" style={{ width: '900px', maxWidth: '95vw' }}>
        
        {/* Modal Header */}
        <div className="erp-modal-header">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText size={22} className="text-blue-500" />
              <span>Détails de la demande #{intervention.id}</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="erp-modal-body p-6">
          <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Infos Client */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted">Informations Patient & Demande</h3>
              <div className="glass-panel" style={{ padding: '20px', background: '#F8FAFC', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted" />
                  <span><strong>Nom :</strong> {intervention.client?.user ? `${intervention.client.user.nom} ${intervention.client.user.prenom || ''}` : 'Inconnu'}</span>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <FileText size={14} className="text-muted" />
                  <span><strong>Email :</strong> {intervention.client?.user?.email || 'Non spécifié'}</span>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-muted" />
                  <span><strong>Date demandée :</strong> {new Date(intervention.date_heure).toLocaleString('fr-FR')}</span>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-muted" />
                  <span><strong>Soin demandé :</strong> {intervention.produit?.nom}</span>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Coins size={14} className="text-muted" />
                  <span><strong>Prix unitaire (Soin) :</strong> {intervention.produit?.prix_client} MAD</span>
                </p>
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '10px', marginTop: '10px' }}>
                  <p className="font-semibold text-sm">Description du problème :</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', marginTop: '4px' }}>
                    {intervention.description_probleme || 'Aucune description fournie'}
                  </p>
                </div>
                {intervention.fichier_joint && (
                  <div style={{ paddingTop: '8px' }}>
                    <strong className="text-sm">Ordonnance / Pièce jointe :</strong>
                    <a 
                      href={`http://127.0.0.1:8000/storage/${intervention.fichier_joint}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-500 hover:text-blue-700 block text-sm mt-1 font-semibold hover:underline"
                    >
                      Voir la pièce jointe
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Status */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted">Statut & Actions</h3>
              <div className="glass-panel" style={{ padding: '20px', background: '#F8FAFC', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p className="text-sm">
                  <strong>Statut actuel :</strong> <span className="status-badge info">{intervention.statut}</span>
                </p>
                
                <div className="flex flex-col gap-2 pt-2">
                  {intervention.statut === 'infirmier_accepte' && (
                    <button 
                      disabled={actionLoading} 
                      onClick={genererDevis} 
                      className="erp-btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <FileText size={18} /> <span>{actionLoading ? 'Génération...' : 'Générer Devis (PDF)'}</span>
                    </button>
                  )}

                  {intervention.statut === 'devis_genere' && (
                    <button 
                      disabled={actionLoading} 
                      onClick={envoyerDevis} 
                      className="erp-btn-primary"
                      style={{ width: '100%', justifyContent: 'center', background: 'var(--gradient-success)', boxShadow: 'none' }}
                    >
                      <Send size={18} /> <span>{actionLoading ? 'Envoi...' : 'Envoyer Devis au Client'}</span>
                    </button>
                  )}

                  {intervention.devis && intervention.statut !== 'terminee' && (
                    <button 
                      onClick={() => consulterDocument('devis', intervention.devis.id)} 
                      className="erp-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                    >
                      <FileText size={18} /> <span>Consulter le Devis (PDF)</span>
                    </button>
                  )}

                  {intervention.statut === 'terminee' && (
                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '10px', marginTop: '10px' }}>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted mb-2">Documents Générés</h4>
                      <div className="flex flex-col gap-2">
                        {intervention.devis && (
                          <button 
                            onClick={() => consulterDocument('devis', intervention.devis.id)} 
                            className="erp-btn-secondary"
                            style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                          >
                            <FileText size={18} /> <span>Consulter le Devis (PDF)</span>
                          </button>
                        )}
                        
                        {intervention.facture && (
                          <button 
                            onClick={() => consulterDocument('facture', intervention.facture.id)} 
                            className="erp-btn-secondary"
                            style={{ width: '100%', justifyContent: 'center', borderColor: '#10B981', color: '#10B981' }}
                          >
                            <FileText size={18} /> <span>Consulter la Facture (PDF)</span>
                          </button>
                        )}

                        {!intervention.devis && !intervention.facture && (
                          <p className="text-sm text-muted italic text-center">Aucun document disponible.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {['en_attente_reponse_infirmier', 'en_attente_reponse_client', 'acceptee', 'terminee'].includes(intervention.statut) && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-muted">
                      <AlertCircle size={16} className="text-blue-500" /> 
                      <span>Aucune action requise pour le moment.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Carte d'affectation (Uniquement si en attente d'affectation) */}
            {intervention.statut === 'en_attente_affectation' && (
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted flex items-center gap-2">
                  <Map size={16} /> <span>Affectation Géolocalisée</span>
                </h3>
                
                {loading ? (
                  <p className="text-center py-6 text-muted">Chargement de la carte et des infirmiers...</p>
                ) : mapData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* Map container */}
                    <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                      <MapContainer center={[mapData.client_localisation.latitude, mapData.client_localisation.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {/* Marqueur Client */}
                        <Marker position={[mapData.client_localisation.latitude, mapData.client_localisation.longitude]}>
                          <Popup><strong>Patient</strong></Popup>
                        </Marker>

                        {/* Marqueurs Infirmiers */}
                        {mapData.infirmiers.map(inf => (
                          <Marker key={inf.id} position={[inf.lat, inf.lng]}>
                            <Popup>
                              <strong>{inf.user ? `${inf.user.nom} ${inf.user.prenom || ''}` : 'Infirmier'}</strong><br/>
                              Distance: {inf.distance_km} km
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                    
                    {/* Nurse selection panel */}
                    <div className="flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-2">
                        <h4 className="font-bold text-sm">Infirmiers disponibles</h4>
                        {mapData.infirmiers.length === 0 ? (
                          <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3 border border-red-100">Aucun infirmier disponible dans le secteur.</p>
                        ) : (
                          <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                            {mapData.infirmiers.map(inf => (
                              <label 
                                key={inf.id} 
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px',
                                  padding: '10px',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  background: selectedInfirmier === inf.id ? 'rgba(37,99,235,0.04)' : '#FFFFFF',
                                  border: selectedInfirmier === inf.id ? '1px solid var(--primary-color)' : '1px solid var(--card-border)'
                                }}
                              >
                                <input 
                                  type="radio" 
                                  name="infirmier" 
                                  style={{ marginTop: '3px' }}
                                  checked={selectedInfirmier === inf.id}
                                  onChange={() => setSelectedInfirmier(inf.id)}
                                />
                                <div>
                                  <p className="font-semibold text-sm margin-0">
                                    {inf.user ? `${inf.user.nom} ${inf.user.prenom || ''}` : 'Infirmier'}
                                  </p>
                                  <p className="text-xs text-muted margin-0">
                                    {inf.distance_km} km de distance
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* TABLEAU SIMULATION DEVIS */}
                      {selectedInfirmier && (
                        <div className="glass-panel" style={{ background: '#FFFFFF', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Simulation du Devis</h4>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted">Prix du Soin</span>
                              <span className="font-medium">{intervention.produit?.prix_client || 0} MAD</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-muted">Distance (km)</span>
                              <input 
                                type="number" 
                                value={distanceManuelle} 
                                onChange={(e) => setDistanceManuelle(e.target.value)} 
                                style={{ width: '80px', padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: '4px', background: '#FFFFFF', color: 'var(--text-main)', textAlign: 'right', outline: 'none' }}
                              />
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-muted">Tarif par km</span>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={tarifKmManuel} 
                                  onChange={(e) => setTarifKmManuel(e.target.value)} 
                                  style={{ width: '80px', padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: '4px', background: '#FFFFFF', color: 'var(--text-main)', textAlign: 'right', outline: 'none' }}
                                /> <span className="text-xs text-muted">MAD</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted">
                              <span>Frais de déplacement</span>
                              <span>{((parseFloat(distanceManuelle)||0) * (parseFloat(tarifKmManuel)||0)).toFixed(2)} MAD</span>
                            </div>

                            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#10B981' }}>
                              <span>Total Estimé (TTC)</span>
                              <span>{((parseFloat(intervention.produit?.prix_client) || 0) + ((parseFloat(distanceManuelle)||0) * (parseFloat(tarifKmManuel)||0))).toFixed(2)} MAD</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={affecterManuellement}
                        disabled={!selectedInfirmier || actionLoading}
                        className="erp-btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <UserCheck size={18} /> <span>{actionLoading ? 'Affectation...' : 'Confirmer l\'affectation'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted">Erreur lors du chargement des données de la carte.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
