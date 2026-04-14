'use client';

import React from 'react';
import VisionScanner from '@/components/VisionScanner';

export default function LabPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '12px', 
          padding: '8px 16px', borderRadius: '30px', background: 'var(--accent-dim)', 
          border: '1px solid var(--accent-glow)', marginBottom: '16px'
        }}>
          <i className="fas fa-flask" style={{ color: 'var(--accent)', fontSize: '14px' }}></i>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>Laboratuvar / Deneysel</span>
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>AI Deneme Okuyucu</h1>
        <p style={{ color: 'var(--text2)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Öğrencinin deneme sonuç belgesini yükleyin, yapay zeka saniyeler içinde tüm netleri ve puanı otomatik olarak çıkarsın.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ 
          padding: '20px 30px', borderBottom: '1px solid var(--border)', 
          display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)' 
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-eye" style={{ color: '#000', fontSize: '18px' }}></i>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Vision AI Modülü</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>LGS-V1 Optik Tanıma Sistemi</div>
          </div>
        </div>
        
        <div style={{ padding: '40px' }}>
          <VisionScanner />
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <i className="fas fa-bolt" style={{ color: 'var(--accent)', fontSize: '24px', marginBottom: '16px' }}></i>
          <h3 style={{ marginBottom: '8px' }}>Yüksek Hassasiyet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.5' }}>Görseldeki tabloları ve sayısal verileri %99 doğrulukla ayrıştırır.</p>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <i className="fas fa-magic" style={{ color: 'var(--accent)', fontSize: '24px', marginBottom: '16px' }}></i>
          <h3 style={{ marginBottom: '8px' }}>Otomatik Kayıt</h3>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.5' }}>Okunan verileri tek tıkla istediğiniz öğrencinin profiline ekleyebilirsiniz.</p>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <i className="fas fa-shield-halved" style={{ color: 'var(--accent)', fontSize: '24px', marginBottom: '16px' }}></i>
          <h3 style={{ marginBottom: '8px' }}>Güvenli Analiz</h3>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.5' }}>Görselleriniz sadece işlem anında kullanılır ve asla kaydedilmez.</p>
        </div>
      </div>
    </div>
  );
}
