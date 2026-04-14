'use client';

import React, { useState, useRef, useEffect } from 'react';
import { scanImageAction } from '@/app/actions/vision';
import { saveExamResult } from '@/app/actions';

interface VisionScannerProps {
  studentId?: string;
  onSuccess?: () => void;
}

export default function VisionScanner({ studentId, onSuccess }: VisionScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Editable fields
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (results?.examName) {
      setExamName(results.examName);
    }
  }, [results]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setResults(null);
      setError(null);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleScan = async () => {
    if (!file || !preview) return;
    setScanning(true);
    setError(null);
    
    try {
      const base64 = await toBase64(file);
      const res = await scanImageAction(base64, file.type);
      
      if (res.success) {
        setResults(res.data);
      } else {
        setError(res.error || 'Tarama sırasında bir hata oluştu.');
      }
    } catch (err: any) {
      setError('Sistem hatası: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!results || !studentId) return;
    setSaving(true);
    
    try {
      const formattedData = {
        trialExamId: 'NEW',
        newTrialName: examName || results.examName || 'AI Taranan Deneme',
        date: examDate,
        ogrenciSayisi: 0,
        basariSirasi: 0,
        toplamNet: results.subjects.reduce((acc: number, s: any) => acc + s.net, 0),
        lgsPuani: results.puan || 0,
        subjects: results.subjects.map((s: any) => ({
          key: s.name.toLowerCase(), // TURKCE -> turkce
          dogru: s.dogru,
          yanlis: s.yanlis
        }))
      };

      await saveExamResult(studentId, formattedData);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Kaydedilirken hata oluştu: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      {error && (
        <div style={{ 
          width: '100%', padding: '16px', borderRadius: '12px', 
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
          color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' 
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', height: '240px',
            border: '2px dashed var(--border)', borderRadius: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(255,255,255,0.01)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <i className="fas fa-cloud-arrow-up" style={{ fontSize: '40px', color: 'var(--text3)', marginBottom: '16px' }}></i>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>Deneme Görselini Yükleyin</p>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>PNG veya JPG (Maks 10MB)</p>
          <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
        </div>
      ) : (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {/* Image Preview Container */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', height: 'fit-content' }}>
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
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 15px' }}></div>
                  <div style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '11px', color: '#fff' }}>Yapay Zeka Analiz Ediyor...</div>
                </div>
              </div>
            )}

            {!results && !scanning && (
              <button 
                onClick={handleScan}
                style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  padding: '12px 24px', borderRadius: '30px', background: 'var(--accent)', color: '#000',
                  border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', width: 'max-content'
                }}>
                <i className="fas fa-microchip" style={{ marginRight: '8px' }}></i> Analizi Başlat
              </button>
            )}
            
            <button 
              onClick={() => { setFile(null); setPreview(null); setResults(null); setError(null); }}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Results Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!results ? (
              <div style={{ height: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border)', padding: '30px', textAlign: 'center' }}>
                <div>
                  <i className="fas fa-robot" style={{ fontSize: '32px', color: 'var(--text3)', marginBottom: '16px', opacity: 0.3 }}></i>
                  <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Henüz analiz yapılmadı.<br/>Başlat butonuna tıklayarak gerçek verileri ayıklayabilirsiniz.</p>
                </div>
              </div>
            ) : (
              <div className="animate-fade-up">
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>Deneme İsmi</label>
                  <input 
                    type="text" 
                    value={examName} 
                    onChange={(e) => setExamName(e.target.value)}
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '10px', 
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: '14px', fontWeight: 600
                    }} 
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>Deneme Tarihi</label>
                  <input 
                    type="date" 
                    value={examDate} 
                    onChange={(e) => setExamDate(e.target.value)}
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '10px', 
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: '14px', fontWeight: 600
                    }} 
                  />
                </div>

                <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', border: '1px solid var(--accent-glow)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Analiz Edilen Puan</div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)' }}>{results.puan || '0.00'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Toplam Net</div>
                      <div style={{ fontSize: '20px', fontWeight: 900 }}>{results.subjects.reduce((acc: number, s: any) => acc + s.net, 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {results.subjects?.map((s: any) => (
                    <div key={s.name} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>{s.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.dogru}D {s.yanlis}Y</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)' }}>{s.net}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {studentId ? (
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ 
                      width: '100%', marginTop: '20px', padding: '14px', borderRadius: '12px', 
                      background: 'var(--accent)', color: '#000', border: 'none',
                      fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)', transition: 'all 0.2s',
                      opacity: saving ? 0.7 : 1
                    }}>
                    {saving ? (
                      <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    ) : (
                      <><i className="fas fa-check-double"></i> Öğrenci Kaydına Aktar</>
                    )}
                  </button>
                ) : (
                  <div style={{ 
                    marginTop: '20px', padding: '14px', borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)',
                    color: 'var(--text3)', fontSize: '12px', textAlign: 'center'
                  }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
                    Bu bir laboratuvar önizlemesidir. Kaydetmek için öğrenci sayfası üzerinden giriş yapın.
                  </div>
                )}
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
