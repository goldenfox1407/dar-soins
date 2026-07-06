import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AbonnementsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/abonnements').catch(() => ({ data: [] }));
      setData(response.data?.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Produits par Abonnement</h1>
          <p className="text-muted text-sm mt-1">Gérez vos données de produits par abonnement ici.</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto' }}>
          + Ajouter
        </button>
      </header>

      {loading ? (
        <div className="text-center p-8 text-muted">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Données brutes (API)</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucune donnée disponible pour le moment.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{item.id || i + 1}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{JSON.stringify(item)}</td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{ color: 'var(--primary-color)', marginRight: '1rem' }}>Modifier</button>
                      <button style={{ color: '#f87171' }}>Supprimer</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
