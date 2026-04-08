import React from 'react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className, size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '22%', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
    >
      {/* Background Square */}
      <rect width="100" height="100" fill="white" />
      
      {/* Planet Circle */}
      <circle cx="50" cy="50" r="38" fill="#D35400" />
      
      {/* Stripes - Matching the image pattern */}
      <path 
        d="M15 40C30 30 70 30 85 40" 
        stroke="white" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      
      {/* Middle stripe with the "Spot" */}
      <path 
        d="M12 55C25 45 45 45 55 55C65 65 85 65 88 55" 
        stroke="white" 
        strokeWidth="9" 
        strokeLinecap="round" 
      />
      <ellipse cx="70" cy="55" rx="10" ry="6" fill="#D35400" />
      <ellipse cx="70" cy="55" rx="12" ry="8" stroke="white" strokeWidth="8" fill="none" />

      {/* Bottom stripe */}
      <path 
        d="M20 70C35 80 65 80 80 70" 
        stroke="white" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
