import React from 'react';

export default function ErpComingSoon({ title, description }) {
  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        gap: '1.5rem'
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem'
        }}>
          🚧
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.8rem',
          color: 'var(--primary-color)',
          fontWeight: '700',
          margin: 0
        }}>
          {title}
        </h1>

        {/* Description */}
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1rem',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          {description || 'Ce module est en cours de développement et sera bientôt disponible. Restez connecté pour les mises à jour !'}
        </p>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.2rem',
          borderRadius: '999px',
          background: 'rgba(251, 191, 36, 0.15)',
          color: '#fbbf24',
          fontSize: '0.85rem',
          fontWeight: '600',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#fbbf24',
            animation: 'pulse 2s infinite'
          }}></span>
          En cours de développement
        </div>
      </div>
    </div>
  );
}
