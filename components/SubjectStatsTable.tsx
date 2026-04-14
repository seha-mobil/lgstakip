'use client';

import React from 'react';

interface SubjectStatsTableProps {
  exams: any[];
}

const subjectMapping: Record<string, { label: string; questions: number }> = {
  turkce: { label: 'Türkçe', questions: 20 },
  inkilap: { label: 'İnkılap', questions: 10 },
  dinkultur: { label: 'Din Kültürü', questions: 10 },
  ingilizce: { label: 'İngilizce', questions: 10 },
  matematik: { label: 'Matematik', questions: 20 },
  fen: { label: 'Fen Bilimleri', questions: 20 },
};

export default function SubjectStatsTable({ exams }: SubjectStatsTableProps) {
  if (!exams.length) return null;

  const stats = Object.keys(subjectMapping).map(key => {
    let totalD = 0;
    let totalY = 0;
    let totalB = 0;

    exams.forEach(ex => {
      const sub = ex.subjects?.find((s: any) => s.subjectKey.toLowerCase() === key.toLowerCase());
      if (sub) {
        totalD += sub.dogru || 0;
        totalY += sub.yanlis || 0;
        totalB += sub.bos || 0;
      }
    });

    const totalQ = totalD + totalY + totalB;
    const successRate = totalQ > 0 ? (totalD / totalQ) * 100 : 0;

    return {
      key,
      label: subjectMapping[key].label,
      totalD,
      totalY,
      totalB,
      totalQ,
      successRate
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {stats.map(s => {
        const dPct = (s.totalD / s.totalQ) * 100;
        const yPct = (s.totalY / s.totalQ) * 100;
        const bPct = (s.totalB / s.totalQ) * 100;

        return (
          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)' }}>{s.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: s.successRate >= 70 ? 'var(--green)' : s.successRate >= 40 ? 'var(--accent)' : 'var(--red)' }}>
                %{s.successRate.toFixed(1).replace('.', ',')} Başarı
              </span>
            </div>
            
            <div style={{ 
              height: '32px', 
              width: '100%', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              display: 'flex',
              border: '1px solid var(--border)' 
            }}>
              {/* Corrects Block */}
              {s.totalD > 0 && (
                <div style={{ 
                  width: `${dPct}%`, 
                  background: 'var(--green)', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: s.totalD > 0 ? '25px' : '0',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                  color: '#fff'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{s.totalD}</span>
                </div>
              )}
              
              {/* Wrongs Block */}
              {s.totalY > 0 && (
                <div style={{ 
                  width: `${yPct}%`, 
                  background: 'var(--red)', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: s.totalY > 0 ? '25px' : '0',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                  color: '#fff'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{s.totalY}</span>
                </div>
              )}

              {/* Blanks Block */}
              {s.totalB > 0 && (
                <div style={{ 
                  width: `${bPct}%`, 
                  background: 'var(--text3)', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: s.totalB > 0 ? '25px' : '0',
                  opacity: 0.6,
                  color: '#fff'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{s.totalB}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
