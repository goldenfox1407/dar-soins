import React, { useState } from 'react';
import { Calendar, Filter, RotateCcw, ChevronDown } from 'lucide-react';

export default function ReportDateFilter({ onFilter, defaultPreset = 'all' }) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [activePreset, setActivePreset] = useState(defaultPreset);

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    let start = '';
    let end = '';

    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      start = todayStr;
      end = todayStr;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
      end = now.toISOString().split('T')[0];
    } else if (preset === 'this_month') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      start = `${y}-${m}-01`;
      end = now.toISOString().split('T')[0];
    } else if (preset === 'this_year') {
      const y = now.getFullYear();
      start = `${y}-01-01`;
      end = now.toISOString().split('T')[0];
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setDateDebut(start);
    setDateFin(end);
    onFilter({ date_debut: start, date_fin: end, preset });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setActivePreset('custom');
    onFilter({ date_debut: dateDebut, date_fin: dateFin, preset: 'custom' });
  };

  const handleReset = () => {
    setActivePreset('all');
    setDateDebut('');
    setDateFin('');
    onFilter({ date_debut: '', date_fin: '', preset: 'all' });
  };

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '0.9rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Quick Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="#2563EB" /> Période :
        </span>

        {[
          { id: 'all', label: "Tout l'historique" },
          { id: 'today', label: "Aujourd'hui" },
          { id: '7days', label: '7 derniers jours' },
          { id: 'this_month', label: 'Ce mois-ci' },
          { id: 'this_year', label: 'Cette année' },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: activePreset === p.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
              background: activePreset === p.id ? '#EFF6FF' : '#FFFFFF',
              color: activePreset === p.id ? '#2563EB' : '#475569',
              fontSize: '0.8rem',
              fontWeight: activePreset === p.id ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Selector */}
      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Du</span>
          <input
            type="date"
            className="glass-input"
            value={dateDebut}
            onChange={(e) => { setDateDebut(e.target.value); setActivePreset('custom'); }}
            style={{ padding: '5px 8px', fontSize: '0.82rem', color: '#1E293B', borderRadius: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Au</span>
          <input
            type="date"
            className="glass-input"
            value={dateFin}
            onChange={(e) => { setDateFin(e.target.value); setActivePreset('custom'); }}
            style={{ padding: '5px 8px', fontSize: '0.82rem', color: '#1E293B', borderRadius: '8px' }}
          />
        </div>

        <button
          type="submit"
          className="erp-btn-primary"
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Filter size={14} /> Filtrer
        </button>

        {(dateDebut || dateFin || activePreset !== 'all') && (
          <button
            type="button"
            onClick={handleReset}
            title="Réinitialiser les filtres de date"
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}
      </form>
    </div>
  );
}
