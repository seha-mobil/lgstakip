'use client';

import React, { useState } from 'react';
import { updateStudent } from '@/app/actions';

const topSchools = [
  { name: 'İstanbul Erkek Lisesi', puan: 500 },
  { name: 'Galatasaray Lisesi', puan: 500 },
  { name: 'Kabataş Erkek Lisesi', puan: 500 },
  { name: 'Ankara Fen Lisesi', puan: 495.20 },
  { name: 'İzmir Fen Lisesi', puan: 494.10 },
  { name: 'Atatürk Fen Lisesi (İST)', puan: 491.50 },
  { name: 'Cağaloğlu Anadolu Lisesi', puan: 488.40 },
  { name: 'Beşiktaş Sakıp Sabancı AL', puan: 486.20 },
  { name: 'Kadıköy Anadolu Lisesi', puan: 485.50 },
  { name: 'Haydarpaşa Lisesi', puan: 484.80 },
];

export default function LiseTargetPicker({ studentId, currentName, currentPuan }: { studentId: string, currentName?: string | null, currentPuan?: number | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customName, setCustomName] = useState(currentName || '');
  const [customPuan, setCustomPuan] = useState(currentPuan?.toString() || '');

  const handleSave = async (name: string, puan: number) => {
    await updateStudent(studentId, { targetLiseName: name, targetLisePuan: puan });
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost"
        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'var(--accent-glow)' }}
      >
        <i className="fas fa-bullseye" style={{ color: 'var(--accent)' }}></i> 
        {currentName ? 'Hedefi Güncelle' : 'Hedef Belirle'}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }} onClick={() => setIsOpen(false)}>
          <div className="glass-card animate-fade-up" style={{ padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Hedef Lise Belirle</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '12px' }}>Popüler Liseler (2025 Taban Puanları)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {topSchools.map(school => (
                  <button 
                    key={school.name}
                    onClick={() => handleSave(school.name, school.puan)}
                    style={{
                      padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer',
                      textAlign: 'left', fontSize: '12px', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{school.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent)' }}>{school.puan.toFixed(2)} Puan</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '12px', fontWeight: 600 }}>Özel Hedef Gir</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Okul Adı" 
                  value={customName} 
                  onChange={e => setCustomName(e.target.value)} 
                />
                <input 
                  type="number" 
                  step="0.01"
                  className="input" 
                  placeholder="Taban Puan" 
                  value={customPuan} 
                  onChange={e => setCustomPuan(e.target.value)} 
                />
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleSave(customName, parseFloat(customPuan))}
                  disabled={!customName || !customPuan}
                >
                  Özel Hedefi Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
