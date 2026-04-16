'use client';

import React from 'react';

export function V2AICoachSidebar({ studentName, goals, riskScore }: { 
  studentName: string, 
  goals: { text: string, completed: boolean }[],
  riskScore: number
}) {
  const completedCount = goals.filter(g => g.completed).length;
  const progressPct = (completedCount / goals.length) * 100;

  return (
    <div className="v2-sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* AI Coach Card */}
      <div className="v2-glass-card v2-neon-border-blue" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>AI Koçu</div>
            <div style={{ fontSize: '12px', color: 'var(--v2-text-dim)' }}>Bugün senin için hazırız!</div>
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--v2-text-dim)' }}>
            Merhaba <b style={{ color: 'white' }}>{studentName}</b>! Bugün özellikle <b style={{ color: 'var(--v2-emerald)' }}>Matematik</b> netlerini artırmaya odaklanmalıyız.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map((goal, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: goal.completed ? 0.5 : 1 }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '6px', 
                border: goal.completed ? 'none' : '2px solid var(--v2-border)',
                background: goal.completed ? 'var(--v2-emerald)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {goal.completed && <i className="fas fa-check" style={{ fontSize: '10px', color: 'white' }}></i>}
              </div>
              <div style={{ fontSize: '13px', color: goal.completed ? 'var(--v2-text-dark)' : 'white' }}>{goal.text}</div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', color: 'var(--v2-text-dim)' }}>
            <span>Günlük Gelişim</span>
            <span>{completedCount}/{goals.length}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--v2-emerald)', boxShadow: '0 0 10px var(--v2-emerald-glow)', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
      </div>

      {/* Risk Score Card */}
      <div className="v2-glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800 }}>Risk Skoru</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: riskScore > 70 ? 'var(--red)' : riskScore > 30 ? '#eab308' : 'var(--v2-emerald)' }}>
            {riskScore}/100
          </div>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ 
            width: `${riskScore}%`, 
            height: '100%', 
            background: `linear-gradient(90deg, #10b981 0%, #eab308 50%, #ef4444 100%)`,
            transition: 'width 0.5s ease'
          }}></div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--v2-text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-info-circle" style={{ color: 'var(--v2-emerald)' }}></i>
          {riskScore < 30 ? 'Düşük Risk: Hedef yolunda kararlı ilerleyiş.' : 'Orta Risk: Matematik netlerinde dalgalanma tespit edildi.'}
        </div>
      </div>
    </div>
  );
}
