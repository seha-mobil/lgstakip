'use client';

import React from 'react';

export function V2Header({ studentName, netIncrease }: { studentName: string, netIncrease: number }) {
  return (
    <div className="v2-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="v2-animate-glow" style={{ fontSize: '30px' }}>👋</div>
          <h1 className="v2-title-main">Hoş geldin, {studentName}</h1>
        </div>
        <div className="v2-subtitle">
          Sonuçlarına göre bu hafta netlerin <b style={{ color: 'var(--v2-emerald)', textShadow: '0 0 10px var(--v2-emerald-glow)' }}>+{netIncrease} arttı!</b> ✨
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="v2-btn-add">
          <i className="fas fa-plus-circle"></i>
          Deneme Ekle
        </button>
      </div>
    </div>
  );
}

export function V2StatCard({ title, value, subValue, trend, type }: { 
  title: string, 
  value: string, 
  subValue?: string, 
  trend?: string,
  type: 'green' | 'blue' | 'purple' | 'gold'
}) {
  const borderColor = type === 'green' ? 'v2-neon-border-green' : type === 'blue' ? 'v2-neon-border-blue' : '';
  
  return (
    <div className={`v2-glass-card ${borderColor}`} style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--v2-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        {trend && (
          <div className={`v2-badge ${type === 'green' ? 'v2-badge-green' : 'v2-badge-blue'}`}>
            {trend}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>{value}</div>
        {subValue && <div style={{ fontSize: '14px', color: 'var(--v2-text-dark)' }}>{subValue}</div>}
      </div>
      
      {type === 'gold' && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--v2-text-dim)' }}>
          <div style={{ width: '4px', height: '4px', background: 'var(--v2-emerald)', borderRadius: '50%' }}></div>
          İdeal Gelişim Lisesi
        </div>
      )}
    </div>
  );
}
