import React from 'react';

export default function Logo({ className = '', size = 32, light = false }) {
  const backendUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '');
  const logoUrl = `${backendUrl}/images/logo.png`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Dar-Soins Logo" 
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '6px', objectFit: 'contain' }} 
      />
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-[#1E293B]'}`}>Dar-Soins</span>
    </div>
  );
}
