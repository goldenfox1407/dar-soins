import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Eye, TrendingUp, Calendar, User, Package } from 'lucide-react';
import VenteDetailsModal from './VenteDetailsModal';

export default function VentesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/ventes').catch(() => ({ data: [] }));
      setData(response.data?.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'en_attente_affectation': 
        return <span className="status-badge warning">À Affecter</span>;
      case 'en_attente_reponse_infirmier': 
        return <span className="status-badge info">Attente Infirmier</span>;
      case 'infirmier_accepte': 
        return <span className="status-badge info">Infirmier OK (Générer Devis)</span>;
      case 'devis_genere': 
        return <span className="status-badge info">Devis Généré</span>;
      case 'en_attente_reponse_client': 
        return <span className="status-badge warning">Attente Client</span>;
      case 'acceptee': 
        return <span className="status-badge success">Confirmée</span>;
      case 'annulee': 
        return <span className="status-badge danger">Annulée</span>;
      default: 
        return <span className="status-badge neutral">{statut}</span>;
    }
  };

  return (
    <div className="erp-page animate-fade-in">
      
      {/* Header section */}
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Ventes / Interventions</h1>
          <p className="erp-page-subtitle">Gérez le cycle de vie des interventions : demandes de soins, affectations et validations.</p>
        </div>
      </header>

      {/* Main List Table card */}
      <div className="erp-card">
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date Demande</th>
                <th>Client</th>
                <th>Produit / Soin</th>
                <th>Statut</th>
                <th>Infirmier Affecté</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    Chargement des interventions...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Aucune intervention enregistrée.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i}>
                    {/* Date */}
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Calendar size={14} />
                        <span>{new Date(item.created_at).toLocaleString('fr-FR')}</span>
                      </div>
                    </td>
                    {/* Client */}
                    <td className="font-semibold">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-muted" />
                        <span>{item.client?.user ? `${item.client.user.nom} ${item.client.user.prenom || ''}` : 'Inconnu'}</span>
                      </div>
                    </td>
                    {/* Produit */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className="text-muted" />
                        <span>{item.produit?.nom}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td>{getStatusBadge(item.statut)}</td>
                    {/* Infirmier */}
                    <td>
                      <span className={item.infirmier?.user ? 'font-semibold' : 'text-muted italic text-sm'}>
                        {item.infirmier?.user ? `${item.infirmier.user.nom} ${item.infirmier.user.prenom || ''}` : 'Non affecté'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setSelectedIntervention(item)}
                        className="erp-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Eye size={14}/> Détails & Actions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIntervention && (
        <VenteDetailsModal 
          intervention={selectedIntervention} 
          onClose={() => setSelectedIntervention(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
