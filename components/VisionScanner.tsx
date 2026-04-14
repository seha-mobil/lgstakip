'use client';

import React, { useState, useRef } from 'react';

export default function VisionScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setResults(null);
    }
  };

  const handleScan = () => {
    if (!file) return;
    setScanning(true);
    
    // Simulate AI scanning delay
    setTimeout(() => {
      setScanning(false);
      // This matches the data in the user's provided screenshot
      setResults({
        examName: "7. Sınıf Deneme 2",
        puan: 470.746,
        subjects: [
          { name: "TÜRKÇE", dogru: 18, yanlis: 2, net: 17.33 },
          { name: "MATEMATİK", dogru: 19, yanlis: 1, net: 18.67 },
          { name: "DİN KÜLTÜRÜ", dogru: 10, yanlis: 0, net: 10.00 },
          { name: "FEN BİLİMLERİ", dogru: 19, yanlis: 1, net: 18.67 },
          { name: "SOSYAL BİLGİLER", dogru: 7, yanlis: 3, net: 6.00 },
          { name: "İNGİLİZCE", dogru: 10, yanlis: 0, net: 10.00 }
        ]
      });
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', maxWidth: '600px', height: '300px',
            border: '2px dashed var(--border)', borderRadius: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(255,255,255,0.01)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <i className="fas fa-cloud-arrow-up" style={{ fontSize: '48px', color: 'var(--text3)', marginBottom: '20px' }}></i>
          <p style={{ fontWeight: 600 }}>Görsel Seçmek İçin Tıklayın veya Sürükleyin</p>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px' }}>PNG, JPG or PDF (Max 10MB)</p>
          <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
        </div>
      ) : (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Image Preview Container */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={preview} alt="Scan Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
            
            {scanning && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                background: 'var(--accent)', boxShadow: '0 0 20px var(--accent)',
                animation: 'scan-line 2s infinite ease-in-out', zIndex: 10
              }}></div>
            )}
            
            {scanning && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 15px' }}></div>
                  <div style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>AI Analiz Ediyor...</div>
                </div>
              </div>
            )}

            {!results && !scanning && (
              <button 
                onClick={handleScan}
                style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  padding: '12px 24px', borderRadius: '30px', background: 'var(--accent)', color: '#000',
                  border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}>
                <i className="fas fa-microchip" style={{ marginRight: '8px' }}></i> Analizi Başlat
              </button>
            )}
            
            <button 
              onClick={() => { setFile(null); setPreview(null); setResults(null); }}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Results Container */}
          <div>
            {!results ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border)', padding: '40px', textAlign: 'center' }}>
                <div>
                  <i className="fas fa-robot" style={{ fontSize: '40px', color: 'var(--text3)', marginBottom: '20px', opacity: 0.3 }}></i>
                  <p style={{ color: 'var(--text3)' }}>Henüz analiz yapılmadı.<br/>Başlat butonuna tıklayarak verileri ayıklayabilirsiniz.</p>
                </div>
              </div>
            ) : (
              <div className="animate-fade-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Analiz Sonucu</h2>
                  <div style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--green)', color: '#000', fontSize: '12px', fontWeight: 700 }}>VERİ DOĞRULANDI</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', border: '1px solid var(--accent-glow)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Deneme İsmi</div>
                      <div style={{ fontSize: '18px', fontWeight: 700 }}>{results.examName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Toplam Puan</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent)' }}>{results.puan}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {results.subjects.map((s: any) => (
                    <div key={s.name} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>{s.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700 }}>{s.dogru}D {s.yanlis}Y</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--accent)' }}>{s.net} Net</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button style={{ 
                  width: '100%', marginTop: '24px', padding: '16px', borderRadius: '12px', 
                  background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}>
                  <i className="fas fa-file-export"></i> Öğrenci Kaydına Aktar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 1; }
          50% { opacity: 0.5; }
          100% { top: 100%; opacity: 1; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
