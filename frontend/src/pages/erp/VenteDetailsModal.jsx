import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { X, Map, FileText, Send, UserCheck, AlertCircle } from 'lucide-react';
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

  const consulterPdf = async (devisId) => {
    try {
      const response = await api.get(`/devis/${devisId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      alert("Erreur lors de la récupération du PDF.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-800">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Détails de la demande #{intervention.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Infos Client */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">Informations Patient & Demande</h3>
            <div className="bg-slate-50 text-slate-700 p-4 rounded-lg border border-slate-100 space-y-2">
              <p><strong>Nom:</strong> {intervention.client?.user ? `${intervention.client.user.nom} ${intervention.client.user.prenom || ''}` : 'Inconnu'}</p>
              <p><strong>Email:</strong> {intervention.client?.user?.email || 'Non spécifié'}</p>
              <p><strong>Date demandée:</strong> {new Date(intervention.date_heure).toLocaleString('fr-FR')}</p>
              <p><strong>Soin demandé:</strong> {intervention.produit?.nom}</p>
              <p><strong>Prix unitaire (Soin):</strong> {intervention.produit?.prix_client} MAD</p>
              <p><strong>Description:</strong> {intervention.description_probleme || 'Aucune description fournie'}</p>
              {intervention.fichier_joint && (
                <p>
                  <strong>Fichier joint (Ordonnance): </strong> 
                  <a href={`http://localhost:8000/storage/${intervention.fichier_joint}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    Voir la pièce jointe
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Actions & Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">Statut & Actions</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
              <p><strong>Statut actuel:</strong> <span className="text-blue-600 font-semibold">{intervention.statut}</span></p>
              
              {intervention.statut === 'infirmier_accepte' && (
                <button disabled={actionLoading} onClick={genererDevis} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2">
                  <FileText size={18} /> {actionLoading ? 'Génération...' : 'Générer Devis (PDF)'}
                </button>
              )}

              {intervention.statut === 'devis_genere' && (
                <button disabled={actionLoading} onClick={envoyerDevis} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded flex items-center justify-center gap-2">
                  <Send size={18} /> {actionLoading ? 'Envoi...' : 'Envoyer Devis au Client'}
                </button>
              )}

              {intervention.devis && (
                <button onClick={() => consulterPdf(intervention.devis.id)} className="w-full bg-slate-100 hover:bg-slate-200 text-blue-600 border border-blue-200 py-2 rounded flex items-center justify-center gap-2 font-semibold transition-colors mt-2">
                  <FileText size={18} /> Consulter le Devis (PDF)
                </button>
              )}

              {['en_attente_reponse_infirmier', 'en_attente_reponse_client', 'acceptee', 'terminee'].includes(intervention.statut) && (
                <div className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                  <AlertCircle size={16} /> Aucune action requise pour le moment.
                </div>
              )}
            </div>
          </div>

          {/* Carte d'affectation (Uniquement si en attente d'affectation) */}
          {intervention.statut === 'en_attente_affectation' && (
            <div className="md:col-span-2 mt-4">
              <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                <Map size={16} /> Affectation Géolocalisée
              </h3>
              
              {loading ? (
                <p>Chargement de la carte...</p>
              ) : mapData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 h-96 bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
                    <MapContainer center={[mapData.client_localisation.latitude, mapData.client_localisation.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      
                      {/* Marqueur Client (Rouge) */}
                      <Marker position={[mapData.client_localisation.latitude, mapData.client_localisation.longitude]}>
                        <Popup><strong>Patient</strong></Popup>
                      </Marker>

                      {/* Marqueurs Infirmiers (Bleu) */}
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
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Infirmiers disponibles</h4>
                    {mapData.infirmiers.length === 0 ? (
                      <p className="text-sm text-red-500">Aucun infirmier disponible.</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {mapData.infirmiers.map(inf => (
                          <label key={inf.id} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${selectedInfirmier === inf.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input 
                              type="radio" 
                              name="infirmier" 
                              className="mt-1"
                              checked={selectedInfirmier === inf.id}
                              onChange={() => setSelectedInfirmier(inf.id)}
                            />
                            <div>
                              <p className="font-semibold text-sm">{inf.user ? `${inf.user.nom} ${inf.user.prenom || ''}` : 'Infirmier'}</p>
                              <p className="text-xs text-slate-500">{inf.distance_km} km de distance</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* TABLEAU SIMULATION DEVIS */}
                    {selectedInfirmier && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-sm mt-4">
                        <h4 className="font-bold text-slate-700 mb-3 uppercase tracking-wider text-xs">Simulation du Devis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Prix du Soin</span>
                            <span className="font-medium">{intervention.produit?.prix_client || 0} MAD</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Distance (km)</span>
                            <input 
                              type="number" 
                              value={distanceManuelle} 
                              onChange={(e) => setDistanceManuelle(e.target.value)} 
                              className="w-20 px-2 py-1 border rounded text-right bg-slate-50"
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Tarif par km</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={tarifKmManuel} 
                                onChange={(e) => setTarifKmManuel(e.target.value)} 
                                className="w-20 px-2 py-1 border rounded text-right bg-slate-50"
                              /> MAD
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-slate-500 pt-1">
                            <span>Frais de déplacement</span>
                            <span>{((parseFloat(distanceManuelle)||0) * (parseFloat(tarifKmManuel)||0)).toFixed(2)} MAD</span>
                          </div>

                          <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center font-bold text-base text-emerald-600">
                            <span>Total Estimé (TTC)</span>
                            <span>{(((parseFloat(intervention.produit?.prix_client) || 0) + ((parseFloat(distanceManuelle)||0) * (parseFloat(tarifKmManuel)||0))) * 1.20).toFixed(2)} MAD</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={affecterManuellement}
                      disabled={!selectedInfirmier || actionLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                      <UserCheck size={18} /> {actionLoading ? 'Affectation...' : 'Confirmer l\'affectation'}
                    </button>
                  </div>
                </div>
              ) : (
                <p>Erreur lors du chargement des données de la carte.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
