'use client';

import React from 'react';

export function V2RadialProgress({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="v2-glass-card" style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '84px', height: '84px' }}>
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle 
            cx="42" 
            cy="42" 
            r={radius} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="8" 
          />
          <circle 
            cx="42" 
            cy="42" 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="8" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 5px ${color})` }}
            transform="rotate(-90 42 42)"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>
          %{percentage}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 800 }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'var(--v2-text-dim)', marginTop: '4px' }}>Ders Başarısı</div>
        <button style={{ marginTop: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontSize: '10px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>
          Ayrıntılar
        </button>
      </div>
    </div>
  );
}
