import React from 'react';

export default function LoadingFallback({ message = 'Chargement en cours...' }) {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        padding: '2rem',
        background: 'transparent',
      }}
    >
      <div 
        style={{
          width: 44,
          height: 44,
          border: '3px solid rgba(37, 99, 235, 0.15)',
          borderTop: '3px solid #2563EB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
