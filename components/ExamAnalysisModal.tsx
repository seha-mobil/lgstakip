'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getExamComparison, getLatestAnalysis, getAverageAnalysis, AnalysisReport } from '@/lib/analysis';
import { updateExamNotes } from '@/app/actions';

interface ExamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  exam: any;
  prevExam?: any;
  targetPuan?: number | null;
  studentColor: string;
  isAverage?: boolean;
  mode?: 'ai' | 'notes';
}

export default function ExamAnalysisModal({ 
  isOpen, 
  onClose, 
  student, 
  exam, 
  prevExam, 
  targetPuan, 
  studentColor, 
  isAverage,
  mode = 'ai'
}: ExamAnalysisModalProps) {
  
  const [examNotes, setExamNotes] = useState(exam?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. SSR & Portal Safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (exam?.notes !== undefined) {
      setExamNotes(exam.notes || '');
    }
  }, [exam]);

  // 3. Global Interactions (ESC key & Scroll Lock)
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Early return only for mounting, NOT for open state to keep hooks consistent
  if (!mounted) return null;

  // Actual logic for content (called only if open to save resources, but hooks were already defined above)
  if (!isOpen) return null;

  const comparison = getExamComparison(exam, prevExam);
  const verbalReports = isAverage ? getAverageAnalysis(student) : getLatestAnalysis(student);

  // Quick stats
  const scoreDiff = comparison.scoreDiff;
  const isUp = scoreDiff > 0;
  const isDown = scoreDiff < 0;

  // Progress Bar Logic
  const basePuan = 400;
  const targetVal = targetPuan || 500;
  const totalRange = Math.max(1, targetVal - basePuan);

  const currentPuan = exam.lgsPuani;
  const prevPuanValue = prevExam ? prevExam.lgsPuani : currentPuan;

  const currentProgressPct = Math.max(0, Math.min(100, ((currentPuan - basePuan) / totalRange) * 100));
  const prevProgressPct = Math.max(0, Math.min(100, ((prevPuanValue - basePuan) / totalRange) * 100));

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateExamNotes(exam.id, examNotes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert("Not kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityColor = (severity: AnalysisReport['severity']) => {
    switch (severity) {
      case 'success': return '#3dd68c';
      case 'danger': return '#f05a5a';
      case 'warning': return '#e8b84b';
      default: return '#4d8ef0';
    }
  };

  const modalContent = (
    <>
      <style jsx>{`
        @keyframes modalShow {
          from { opacity: 0; transform: translate(-50%, -43%) scale(0.92); filter: blur(15px); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        }
        @keyframes overlayShow {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(20px); }
        }
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stagger-1 { animation: staggerIn 0.5s both 0.1s; }
        .animate-stagger-2 { animation: staggerIn 0.5s both 0.2s; }
      `}</style>

      {/* The Modal Overlay */}
      <div 
        onClick={onClose}
        style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.88)', zIndex: 100000,
          animation: 'overlayShow 0.4s forwards',
          cursor: 'zoom-out'
        }}
      >
        {/* The Analysis Dialog Body */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '900px', maxWidth: '95vw', background: 'rgba(12, 18, 28, 0.99)',
            borderRadius: '32px', border: `1px solid ${studentColor}70`,
            boxShadow: `0 0 120px ${studentColor}15, 0 50px 100px rgba(0,0,0,0.95)`,
            zIndex: 100001, padding: '48px', display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '44px',
            animation: 'modalShow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            cursor: 'default',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '12px',
              color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '18px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(240, 90, 90, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(240, 90, 90, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text3)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Left Panel: Numerical Stats */}
          <div className="animate-stagger-1" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '44px' }}>
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-file-invoice" style={{ color: 'var(--accent)', fontSize: '20px' }}></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Deneme Karnesi</h4>
                <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 500 }}>
                    {isAverage ? 'Tüm zamanların genel ortalaması' : `${exam.trialExam.name} • ${new Date(exam.date).toLocaleDateString('tr-TR')}`}
                </div>
              </div>
            </div>

            {/* Subject Stats */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Ders Bazlı Netler</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {comparison.subjectDiffs.map(sub => (
                  <div key={sub.subjectName} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 700, marginBottom: '6px' }}>{sub.subjectName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{sub.currentNet.toFixed(2)}</span>
                      {!isAverage && prevExam && sub.diff !== 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 800, color: sub.diff > 0 ? '#3dd68c' : '#f05a5a', padding: '2px 8px', background: sub.diff > 0 ? 'rgba(61, 214, 140, 0.1)' : 'rgba(240, 90, 90, 0.1)', borderRadius: '20px' }}>
                          {sub.diff > 0 ? '+' : ''}{sub.diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {targetPuan && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: isDown ? '#f05a5a' : 'var(--accent)', fontWeight: 800, letterSpacing: '2px' }}>
                        {isDown ? 'PERFORMANS GERİLEMESİ' : 'HEDEF İLERLEMESİ'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '4px' }}>{student.targetLiseName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: isDown ? '#f05a5a' : 'var(--accent)' }}>
                        {isDown ? `-%${(prevProgressPct - currentProgressPct).toFixed(1)}` : `%${currentProgressPct.toFixed(1)}`}
                    </div>
                  </div>
                </div>

                <div style={{ height: '12px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', display: 'flex', position: 'relative' }}>
                  {!isAverage && isUp ? (
                    <>
                      <div style={{ width: `${prevProgressPct}%`, height: '100%', background: 'var(--accent)' }} />
                      <div style={{ width: `${currentProgressPct - prevProgressPct}%`, height: '100%', background: '#3dd68c', boxShadow: '0 0 15px #3dd68c' }} />
                    </>
                  ) : !isAverage && isDown ? (
                    <>
                      <div style={{ width: `${currentProgressPct}%`, height: '100%', background: 'var(--accent)' }} />
                      <div style={{ width: `${prevProgressPct - currentProgressPct}%`, height: '100%', background: '#f05a5a', boxShadow: '0 0 15px #f05a5a', opacity: 0.8 }} />
                    </>
                  ) : (
                    <div style={{ width: `${currentProgressPct}%`, height: '100%', background: 'var(--accent)' }} />
                  )}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text3)' }}>{targetVal.toFixed(0)} Puan Hedefi</span>
                  {!isAverage && scoreDiff !== 0 && (
                    <span style={{ fontWeight: 800, color: isUp ? '#3dd68c' : '#f05a5a' }}>
                      Puan Etkisi: {isUp ? '+' : ''}{scoreDiff.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: AI Analysis OR Notes */}
          <div className="animate-stagger-2" style={{ display: 'flex', flexDirection: 'column' }}>
            {mode === 'ai' ? (
              <>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-wand-magic-sparkles" style={{ color: 'var(--accent)', fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>AI Analiz ve Tavsiyeler</h4>
                    <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Kişisel performans rehberiniz</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {verbalReports.map((report, idx) => {
                    const colors = getSeverityColor(report.severity);
                    return (
                      <div 
                        key={idx} 
                        className="animate-fade-up"
                        style={{ 
                          padding: '20px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', 
                          borderLeft: `5px solid ${colors}`, fontSize: '15px', lineHeight: '1.7',
                          color: 'var(--text2)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                          animationDelay: `${idx * 0.1}s`,
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderLeftWidth: '5px'
                        }}
                      >
                        {report.message}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-sticky-note" style={{ color: 'var(--accent)', fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Sınav Analiz Notları</h4>
                    <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Bu sınav özelindeki gözlemleriniz</div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <textarea 
                        value={examNotes}
                        onChange={(e) => setExamNotes(e.target.value)}
                        placeholder="Örn: 'Matematikte sürem yetmedi, Fen Bilimlerinde 3 soruyu dikkatsizlikten kaçırdım...'"
                        style={{
                            width: '100%',
                            flex: 1,
                            minHeight: '250px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '20px',
                            color: '#fff',
                            fontSize: '15px',
                            lineHeight: '1.6',
                            resize: 'none',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                    />

                    <button 
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                        style={{
                            padding: '16px',
                            background: saveSuccess ? 'var(--green)' : 'var(--accent)',
                            color: '#000',
                            borderRadius: '16px',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {isSaving ? (
                             <i className="fas fa-circle-notch fa-spin"></i>
                        ) : saveSuccess ? (
                             <><i className="fas fa-check"></i> Kaydedildi</>
                        ) : (
                             <><i className="fas fa-save"></i> Notları Kaydet</>
                        )}
                    </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
