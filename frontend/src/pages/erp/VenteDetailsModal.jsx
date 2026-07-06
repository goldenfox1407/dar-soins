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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-200 shadow-2xl animate-scale-in">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={22} className="text-blue-500" />
            <span>Détails de la demande #{intervention.id}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Infos Client */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Informations Patient & Demande</h3>
            <div className="bg-slate-950/40 text-slate-300 p-5 rounded-xl border border-slate-800 space-y-3 shadow-inner">
              <p className="flex items-center gap-2">
                <User size={14} className="text-slate-500" />
                <span><strong>Nom:</strong> {intervention.client?.user ? `${intervention.client.user.nom} ${intervention.client.user.prenom || ''}` : 'Inconnu'}</span>
              </p>
              <p className="flex items-center gap-2">
                <FileText size={14} className="text-slate-500" />
                <span><strong>Email:</strong> {intervention.client?.user?.email || 'Non spécifié'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500" />
                <span><strong>Date demandée:</strong> {new Date(intervention.date_heure).toLocaleString('fr-FR')}</span>
              </p>
              <p className="flex items-center gap-2">
                <Package size={14} className="text-slate-500" />
                <span><strong>Soin demandé:</strong> {intervention.produit?.nom}</span>
              </p>
              <p className="flex items-center gap-2">
                <Coins size={14} className="text-slate-500" />
                <span><strong>Prix unitaire (Soin):</strong> {intervention.produit?.prix_client} MAD</span>
              </p>
              <div className="border-t border-slate-800/80 pt-3">
                <p><strong>Description du problème:</strong></p>
                <p className="text-slate-400 text-sm mt-1 bg-slate-950/50 p-3 rounded-lg border border-slate-850">{intervention.description_probleme || 'Aucune description fournie'}</p>
              </div>
              {intervention.fichier_joint && (
                <div className="pt-2">
                  <strong>Ordonnance / Pièce jointe:</strong>
                  <a 
                    href={`http://127.0.0.1:8000/storage/${intervention.fichier_joint}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block text-blue-400 hover:text-blue-300 transition-colors mt-1 font-semibold text-sm hover:underline"
                  >
                    Voir la pièce jointe
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions & Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Statut & Actions</h3>
            <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4 shadow-inner">
              <p><strong>Statut actuel:</strong> <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{intervention.statut}</span></p>
              
              <div className="space-y-2 pt-2">
                {intervention.statut === 'infirmier_accepte' && (
                  <button 
                    disabled={actionLoading} 
                    onClick={genererDevis} 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <FileText size={18} /> <span>{actionLoading ? 'Génération...' : 'Générer Devis (PDF)'}</span>
                  </button>
                )}

                {intervention.statut === 'devis_genere' && (
                  <button 
                    disabled={actionLoading} 
                    onClick={envoyerDevis} 
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Send size={18} /> <span>{actionLoading ? 'Envoi...' : 'Envoyer Devis au Client'}</span>
                  </button>
                )}

                {intervention.devis && intervention.statut !== 'terminee' && (
                  <button 
                    onClick={() => consulterDocument('devis', intervention.devis.id)} 
                    className="w-full bg-slate-950 hover:bg-slate-850 text-blue-400 hover:text-blue-300 border border-blue-500/20 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer"
                  >
                    <FileText size={18} /> <span>Consulter le Devis (PDF)</span>
                  </button>
                )}

                {intervention.statut === 'terminee' && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-xs">Documents Générés</h4>
                    <div className="space-y-2">
                      {intervention.devis && (
                        <button 
                          onClick={() => consulterDocument('devis', intervention.devis.id)} 
                          className="w-full bg-slate-950 hover:bg-slate-850 text-blue-400 hover:text-blue-300 border border-blue-500/20 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer"
                        >
                          <FileText size={18} /> <span>Consulter le Devis (PDF)</span>
                        </button>
                      )}
                      
                      {intervention.facture && (
                        <button 
                          onClick={() => consulterDocument('facture', intervention.facture.id)} 
                          className="w-full bg-slate-950 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer"
                        >
                          <FileText size={18} /> <span>Consulter la Facture (PDF)</span>
                        </button>
                      )}

                      {!intervention.devis && !intervention.facture && (
                        <p className="text-sm text-slate-500 italic text-center">Aucun document disponible.</p>
                      )}
                    </div>
                  </div>
                )}

                {['en_attente_reponse_infirmier', 'en_attente_reponse_client', 'acceptee', 'terminee'].includes(intervention.statut) && (
                  <div className="text-sm text-slate-500 flex items-center gap-2 p-3 bg-slate-900/40 rounded-lg border border-slate-850 mt-2">
                    <AlertCircle size={16} className="text-slate-400" /> 
                    <span>Aucune action requise pour le moment.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte d'affectation (Uniquement si en attente d'affectation) */}
          {intervention.statut === 'en_attente_affectation' && (
            <div className="md:col-span-2 mt-4 space-y-4">
              <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider flex items-center gap-2">
                <Map size={16} /> <span>Affectation Géolocalisée</span>
              </h3>
              
              {loading ? (
                <p className="text-center py-6 text-slate-500">Chargement de la carte et des infirmiers...</p>
              ) : mapData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map container */}
                  <div className="lg:col-span-2 h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
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
                  
                  {/* Nurse selection panel */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-white">Infirmiers disponibles</h4>
                      {mapData.infirmiers.length === 0 ? (
                        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">Aucun infirmier disponible dans le secteur.</p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                          {mapData.infirmiers.map(inf => (
                            <label 
                              key={inf.id} 
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                selectedInfirmier === inf.id 
                                  ? 'border-blue-500 bg-blue-500/10' 
                                  : 'border-slate-800 bg-slate-950/20 hover:bg-slate-800/40 text-slate-300'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="infirmier" 
                                className="mt-1"
                                checked={selectedInfirmier === inf.id}
                                onChange={() => setSelectedInfirmier(inf.id)}
                              />
                              <div>
                                <p className="font-semibold text-sm text-white">{inf.user ? `${inf.user.nom} ${inf.user.prenom || ''}` : 'Infirmier'}</p>
                                <p className="text-xs text-slate-500">{inf.distance_km} km de distance</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* TABLEAU SIMULATION DEVIS */}
                    {selectedInfirmier && (
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 shadow-sm text-sm">
                        <h4 className="font-bold text-slate-400 mb-3 uppercase tracking-wider text-xs">Simulation du Devis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Prix du Soin</span>
                            <span className="font-medium text-white">{intervention.produit?.prix_client || 0} MAD</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Distance (km)</span>
                            <input 
                              type="number" 
                              value={distanceManuelle} 
                              onChange={(e) => setDistanceManuelle(e.target.value)} 
                              className="w-20 px-2 py-1 border border-slate-700 rounded bg-slate-900 text-white text-right outline-none focus:border-blue-500 text-xs"
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Tarif par km</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={tarifKmManuel} 
                                onChange={(e) => setTarifKmManuel(e.target.value)} 
                                className="w-20 px-2 py-1 border border-slate-700 rounded bg-slate-900 text-white text-right outline-none focus:border-blue-500 text-xs"
                              /> <span className="text-xs text-slate-400">MAD</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-slate-500 pt-1 text-xs">
                            <span>Frais de déplacement</span>
                            <span>{((parseFloat(distanceManuelle)||0) * (parseFloat(tarifKmManuel)||0)).toFixed(2)} MAD</span>
                          </div>

                          <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between items-center font-bold text-sm text-emerald-400">
                            <span>Total Estimé (TTC)</span>
                            <span>{(((parseFloat(intervention.produit?.prix_client) || 0) + ((parseFloat(distanceManuelle)||0) * (parseFloat(tarifKmManuel)||0))) * 1.20).toFixed(2)} MAD</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={affecterManuellement}
                      disabled={!selectedInfirmier || actionLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <UserCheck size={18} /> <span>{actionLoading ? 'Affectation...' : 'Confirmer l\'affectation'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center">Erreur lors du chargement des données de la carte.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
