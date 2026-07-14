import React from 'react';

export default function Logo({ className = '', size = 32, light = false }) {
  // SVG of a house with a medical cross inside
  // House lines in Royal Blue (#2563EB)
  // Cross in Emerald Green (#10B981)
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* House Outline (Royal Blue) */}
        <path 
          d="M10 45L50 15L90 45V85H10V45Z" 
          stroke="#2563EB" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Medical Cross (Emerald Green) */}
        <path 
          d="M42 42H58V50H66V66H58V74H42V66H34V50H42V42Z" 
          fill="#10B981" 
        />
        <path 
          d="M50 42V74M34 58H66" 
          stroke="#10B981" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-[#1E293B]'}`}>Dar-Soins</span>
    </div>
  );
}
