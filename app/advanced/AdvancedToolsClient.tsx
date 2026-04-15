'use client';

import React, { useState } from 'react';
import VisionScanner from '@/components/VisionScanner';
import LiseTargetPicker from '@/components/LiseTargetPicker';
import PerformanceAnalyzer from '@/components/PerformanceAnalyzer';

interface AdvancedToolsClientProps {
  students: any[];
}

export default function AdvancedToolsClient({ students }: AdvancedToolsClientProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'targets' | 'analysis'>('targets');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '12px', 
          padding: '8px 16px', borderRadius: '30px', background: 'var(--accent-dim)', 
          border: '1px solid var(--accent-glow)', marginBottom: '16px'
        }}>
          <i className="fas fa-flask" style={{ color: 'var(--accent)', fontSize: '14px' }}></i>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>Gelişmiş Araçlar & Beta Laboratuvarı</span>
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>LGS Analiz Merkezi</h1>
        <p style={{ color: 'var(--text2)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Hedef puan takibi, akıllı performans analizleri ve yapay zeka destekli deneme okuma araçlarını deneyimleyin.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="glass-card" style={{ 
        display: 'flex', 
        padding: '6px', 
        gap: '6px', 
        marginBottom: '30px', 
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        width: 'fit-content',
        margin: '0 auto 40px'
      }}>
        <TabButton 
          active={activeTab === 'targets'} 
          onClick={() => setActiveTab('targets')} 
          icon="fa-bullseye" 
          label="Hedef Yönetimi" 
        />
        <TabButton 
          active={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')} 
          icon="fa-brain" 
          label="Performans Analizi" 
        />
        <TabButton 
          active={activeTab === 'ai'} 
          onClick={() => setActiveTab('ai')} 
          icon="fa-robot" 
          label="AI Deneme Okuyucu" 
        />
      </div>

      {/* Content Area */}
      <div className="animate-fade-up">
        {activeTab === 'targets' && (
          <div className="student-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {students.map(student => {
              const avgPuan = student.examResults.reduce((acc: number, ex: any) => acc + ex.lgsPuani, 0) / (student.examResults.length || 1);
              const progress = student.targetLisePuan ? Math.min(100, (avgPuan / student.targetLisePuan) * 100) : 0;
              
              return (
                <div key={student.id} className="glass-card card-pad" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: student.color }}></div>
                      <h3 style={{ fontWeight: 800, fontSize: '18px' }}>{student.name}</h3>
                    </div>
                    <LiseTargetPicker 
                      studentId={student.id} 
                      currentName={student.targetLiseName} 
                      currentPuan={student.targetLisePuan} 
                    />
                  </div>

                  {student.targetLiseName ? (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>
                        Hedef: <b style={{ color: 'var(--text)' }}>{student.targetLiseName}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text3)' }}>Başarı Oranı</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>%{progress.toFixed(1)}</span>
                      </div>
                      <div className="prog-track" style={{ height: '10px', borderRadius: '5px' }}>
                        <div 
                          className="prog-fill" 
                          style={{ 
                            width: `${progress}%`, 
                            background: 'var(--accent)',
                            boxShadow: '0 0 15px var(--accent-dim)'
                          }}
                        ></div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '12px', textAlign: 'center' }}>
                        Hedeflenen: <b>{student.targetLisePuan}</b> | Ortalamayla Arasındaki Fark: <b>{Math.abs((student.targetLisePuan || 0) - avgPuan).toFixed(1)}</b>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Henüz bir hedef belirlenmedi.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div className="glass-card card-pad" style={{ height: 'fit-content' }}>
              <div className="sec-title" style={{ marginBottom: '20px' }}>Öğrenci Seç</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {students.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className="btn btn-ghost"
                    style={{ 
                      justifyContent: 'flex-start',
                      background: selectedStudentId === s.id ? 'var(--accent-dim)' : 'transparent',
                      borderColor: selectedStudentId === s.id ? 'var(--accent)' : 'transparent',
                      color: selectedStudentId === s.id ? 'var(--accent)' : 'var(--text)'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></div>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card card-pad">
              <div className="sec-title" style={{ marginBottom: '24px' }}>
                <i className="fas fa-brain" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>
                {selectedStudent?.name} - Akıllı Analiz Raporu
              </div>
              {selectedStudent ? (
                <PerformanceAnalyzer student={selectedStudent} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                  Analiz için lütfen soldan bir öğrenci seçin.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ 
              padding: '20px 30px', borderBottom: '1px solid var(--border)', 
              display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)' 
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-eye" style={{ color: '#000', fontSize: '18px' }}></i>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Vision AI Modülü</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Tam Otomatik Deneme Karşılaştırma</div>
              </div>
            </div>
            <div style={{ padding: '40px' }}>
              <VisionScanner />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
      style={{ 
        padding: '10px 20px', 
        fontSize: '13px', 
        borderRadius: '12px',
        justifyContent: 'center',
        minWidth: '160px',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#000' : 'var(--text2)',
        borderColor: 'transparent'
      }}
    >
      <i className={`fas ${icon}`} style={{ marginRight: '8px' }}></i>
      {label}
    </button>
  );
}
