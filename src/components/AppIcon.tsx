import React from 'react';

export const AppIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 192, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 192 192" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="96" cy="96" r="96" fill="#1f2937" />
      
      {/* Portfolio Chart Icon */}
      <g transform="translate(48, 48)">
        {/* Pie Chart Segments */}
        <path d="M48 16 A32 32 0 0 1 80 48 L48 48 Z" fill="#3b82f6" />
        <path d="M80 48 A32 32 0 0 1 64 78 L48 48 Z" fill="#10b981" />
        <path d="M64 78 A32 32 0 0 1 32 78 L48 48 Z" fill="#f59e0b" />
        <path d="M32 78 A32 32 0 0 1 16 48 L48 48 Z" fill="#ef4444" />
        <path d="M16 48 A32 32 0 0 1 48 16 L48 48 Z" fill="#8b5cf6" />
        
        {/* Center Circle */}
        <circle cx="48" cy="48" r="12" fill="#1f2937" />
        
        {/* Trending Arrow */}
        <path d="M44 44 L52 36 L48 36 L48 32 L56 32 L56 40 L52 40 L52 44 Z" fill="#10b981" />
      </g>
      
      {/* App Name */}
      <text x="96" y="160" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
        Portfolio Pro
      </text>
    </svg>
  );
};