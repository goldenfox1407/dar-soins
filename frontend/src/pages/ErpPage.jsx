import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ErpPage() {
  const location = useLocation();
  const path = location.pathname.replace('/gestionnaire/', '');
  
  return (
    <div className="glass-panel p-8 text-center mt-10 animate-fade-in" style={{ padding: '3rem' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
        Module : {path.toUpperCase()}
      </h2>
      <p className="text-muted">
        Cette interface est en cours de construction dans le cadre de la mise à jour ERP (Stocky style).
        <br/><br/>
        Prochaine étape : Lier cette vue à la base de données PostgreSQL.
      </p>
    </div>
  );
}
