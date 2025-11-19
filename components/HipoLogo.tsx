import React from 'react';

export const HipoLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,40 C30,20 45,10 65,10 C80,10 90,20 90,40 C90,55 80,60 75,60 C75,60 75,75 80,80 C80,85 75,90 60,90 L40,90 C25,90 20,80 20,60 C20,50 30,50 30,40 Z M65,25 C68,25 70,23 70,20 C70,17 68,15 65,15 C62,15 60,17 60,20 C60,23 62,25 65,25 Z" />
  </svg>
);