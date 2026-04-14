'use client';

import React, { useState } from 'react';
import { updateStudent } from '@/app/actions';

const topSchools = [
  { name: 'İstanbul Erkek Lisesi', puan: 494.5 },
  { name: 'Galatasaray Lisesi', puan: 500 },
  { name: 'Kabataş Erkek Lisesi', puan: 494.5 },
  { name: 'Atatürk Fen Lisesi', puan: 491.5 },
  { name: 'Cağaloğlu Anadolu Lisesi', puan: 488.4 },
  { name: 'Hüseyin Avni Sözen AL', puan: 486.6 },
  { name: 'Kadıköy Anadolu Lisesi', puan: 485.5 },
  { name: 'Beşiktaş Sakıp Sabancı AL', puan: 480.2 },
  { name: 'Ş. İlhan Varank Fen Lisesi', puan: 461.5 },
  { name: 'Burak Bora Anadolu Lisesi', puan: 476.9 },
  { name: 'Haydarpaşa Lisesi', puan: 478.8 },
  { name: 'Kartal Anadolu Lisesi', puan: 472.4 },
  { name: 'İstanbul Anadolu Lisesi', puan: 465.3 },
  { name: 'Validebağ Fen Lisesi', puan: 468.1 },
  { name: 'Hacı Sabancı Anadolu Lisesi', puan: 442.5 },
  { name: 'Kartal Köy Hizmetleri AL', puan: 450.2 },
  { name: 'Y.İ. Alanyalı Fen Lisesi', puan: 465.1 },
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
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost"
        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'var(--accent-glow)' }}
      >
        <i className="fas fa-bullseye" style={{ color: 'var(--accent)' }}></i> 
        {currentName ? 'Hedefi Güncelle' : 'Hedef Belirle'}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="glass-card animate-fade-up" 
            style={{ 
              position: 'absolute', 
              top: 'calc(100% + 8px)', 
              right: 0, 
              zIndex: 100, 
              padding: '20px', 
              width: '320px', 
              maxHeight: '400px', 
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              border: '1px solid var(--accent-glow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Hedef Lise</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '10px' }}>Popüler Seçenekler</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topSchools.map(school => (
                  <button 
                    key={school.name}
                    onClick={() => handleSave(school.name, school.puan)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer',
                      textAlign: 'left', fontSize: '11px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontWeight: 600 }}>{school.name}</span>
                    <span style={{ color: 'var(--accent)', fontSize: '10px' }}>{school.puan.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '10px' }}>Veya Manuel Gir</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input" 
                  style={{ height: '32px', fontSize: '12px' }}
                  placeholder="Okul Adı" 
                  value={customName} 
                  onChange={e => setCustomName(e.target.value)} 
                />
                <input 
                  type="number" 
                  step="0.01"
                  className="input" 
                  style={{ height: '32px', fontSize: '12px' }}
                  placeholder="Puan" 
                  value={customPuan} 
                  onChange={e => setCustomPuan(e.target.value)} 
                />
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', height: '32px', fontSize: '11px', justifyContent: 'center' }}
                  onClick={() => handleSave(customName, parseFloat(customPuan))}
                  disabled={!customName || !customPuan}
                >
                  Kaydet
                </button>
                {currentName && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ width: '100%', height: '32px', fontSize: '11px', justifyContent: 'center', color: 'var(--red)', borderColor: 'rgba(240, 90, 90, 0.2)' }}
                    onClick={async () => {
                      if (confirm('Hedefi kaldırmak istediğinize emin misiniz?')) {
                        await updateStudent(studentId, { targetLiseName: null, targetLisePuan: null });
                        setIsOpen(false);
                      }
                    }}
                  >
                    <i className="fas fa-trash-alt"></i> Hedefi Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
