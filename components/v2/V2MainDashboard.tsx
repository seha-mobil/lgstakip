'use client';

import React, { useState } from 'react';
import { ProgressChart } from '@/components/ClientCharts';

export function V2MainDashboard({ exams, studentColor }: { exams: any[], studentColor: string }) {
  const [activeTab, setActiveTab] = useState('net');

  return (
    <div className="v2-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Chart Section */}
      <div className="v2-glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('net')}
              className={`v2-tab-btn ${activeTab === 'net' ? 'active' : ''}`}
            >
              Net Grafiği
            </button>
            <button 
              onClick={() => setActiveTab('ders')}
              className={`v2-tab-btn ${activeTab === 'ders' ? 'active' : ''}`}
            >
              Ders Performansı
            </button>
            <button 
              onClick={() => setActiveTab('tempo')}
              className={`v2-tab-btn ${activeTab === 'tempo' ? 'active' : ''}`}
            >
              Çalışma Temposu
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--v2-text-dark)' }}>
            Son 12 Deneme
          </div>
        </div>
        
        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
          <ProgressChart exams={exams} color={studentColor} />
          {/* Custom Overlay for Puan Label in chart */}
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            background: 'var(--v2-emerald)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '11px', 
            fontWeight: 800,
            boxShadow: '0 0 10px var(--v2-emerald-glow)'
          }}>
            477,5 Puan Hedefi
          </div>
        </div>
      </div>

      {/* Recent Exams Table-like List */}
      <div className="v2-glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Son 5 Deneme</div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--v2-emerald)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Tüm Denemeler <i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i>
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {exams.slice(-5).reverse().map((exam, i) => (
            <div key={exam.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 16px', 
              borderRadius: '12px',
              background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              border: i === 0 ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--v2-text-dim)', width: '80px' }}>
                  {new Date(exam.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', flex: 1 }}>{exam.trialExam.name}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '80px' }}>
                   <i className="fas fa-chart-line" style={{ color: 'var(--v2-emerald)', fontSize: '12px' }}></i>
                   <span style={{ fontWeight: 800, color: 'var(--v2-emerald)' }}>+{Math.floor(Math.random() * 5) + 3} Net</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px' }}>
                   <div style={{ height: '4px', flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                     <div style={{ width: '85%', height: '100%', background: 'white', borderRadius: '10px' }}></div>
                   </div>
                   <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--v2-text-dim)' }}>85%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
