import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import api from '../../services/api';

export default function PermissionsList() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Permissions Système</h1>
          <p className="text-muted text-sm mt-1">Liste de toutes les permissions disponibles dans le système.</p>
        </div>
      </header>

      {loading ? (
        <div className="text-center p-8 text-muted">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Clé de permission</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Guard</th>
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune permission trouvée.</td>
                </tr>
              ) : (
                permissions.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{item.id}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                      <Key size={14} style={{ display: 'inline', marginRight: '8px', color: '#38bdf8' }} />
                      {item.name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.guard_name}</td>
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
