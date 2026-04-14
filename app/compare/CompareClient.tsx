'use client';

import { useState, useMemo } from 'react';

export default function CompareClient({ students }: { students: any[] }) {
  const [mode, setMode] = useState<'all' | 'common'>('all');

  // Find exams with at least 2 participants globally
  const commonExamIds = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      s.examResults.forEach((r: any) => {
        if (!r.trialExamId) return;
        counts[r.trialExamId] = (counts[r.trialExamId] || 0) + 1;
      });
    });
    return Object.keys(counts).filter(id => counts[id] >= 2);
  }, [students]);

  const stats = useMemo(() => {
    return students.map(s => {
      let resultsToMath = s.examResults;
      
      if (mode === 'common') {
        resultsToMath = s.examResults.filter((r: any) => commonExamIds.includes(r.trialExamId));
      }

      if (resultsToMath.length === 0) {
        return { ...s, avgNet: 0, avgLgs: 0, count: 0 };
      }

      const avgNet = resultsToMath.reduce((a: number, e: any) => a + e.toplamNet, 0) / resultsToMath.length;
      const avgLgs = resultsToMath.reduce((a: number, e: any) => a + e.lgsPuani, 0) / resultsToMath.length;
      
      return { 
        ...s, 
        avgNet: Math.round(avgNet * 100) / 100, 
        avgLgs: Math.round(avgLgs * 100) / 100,
        count: resultsToMath.length
      };
    }).sort((a, b) => b.avgNet - a.avgNet);
  }, [students, mode, commonExamIds]);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '24px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        padding: '6px',
        borderRadius: '14px',
        width: 'fit-content',
        margin: '0 auto 24px'
      }}>
        <button 
          onClick={() => setMode('all')}
          className={`btn ${mode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '12px', padding: '8px 16px', height: 'auto' }}
        >
          Genel Ortalama
        </button>
        <button 
          onClick={() => setMode('common')}
          className={`btn ${mode === 'common' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '12px', padding: '8px 16px', height: 'auto' }}
        >
          Ortak Sınavlar
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="sec-title" style={{ margin: 0 }}>
            {mode === 'all' ? 'Tüm Denemeler Ortalaması' : 'Ortak Denemeler Ortalaması'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
             {mode === 'all' ? 'Tüm Kayıtlar' : `${commonExamIds.length} Ortak Sınav`}
          </div>
        </div>

        {stats.map((item, i) => {
          const p = (item.avgNet / 90) * 100;
          const isBest = i === 0 && item.avgNet > 0;
          const hasData = item.count > 0;

          return (
            <div key={item.id} style={{ marginBottom: '20px', opacity: hasData ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: 'var(--text3)' }}>
                    {i + 1}
                  </div>
                  <div style={{ background: item.color, width: '10px', height: '10px', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</span>
                  {isBest && <span style={{ fontSize: '9px', background: 'rgba(61,214,140,0.15)', color: 'var(--green)', padding: '2px 7px', borderRadius: '20px', fontWeight: 800, fontFamily: 'var(--mono)' }}>LİDER</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', color: item.color, fontSize: '15px' }}>
                    {hasData ? item.avgNet : '--'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                    {item.count} Sınav
                  </div>
                </div>
              </div>
              <div className="prog-track" style={{ height: '8px', background: 'rgba(255,255,255,0.03)' }}>
                <div className="prog-fill" style={{ 
                  width: hasData ? (Math.min(100, p) + '%') : '0%', 
                  background: `linear-gradient(90deg, ${item.color}bb, ${item.color})`,
                  boxShadow: isBest ? `0 0 10px ${item.color}44` : 'none'
                }}></div>
              </div>
            </div>
          );
        })}

        {mode === 'common' && commonExamIds.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: '13px' }}>
            <i className="fas fa-info-circle" style={{ marginBottom: '10px', display: 'block', fontSize: '20px' }}></i>
            Henüz en az 2 kişinin ortak girdiği bir sınav bulunamadı.
          </div>
        )}
      </div>
    </>
  );
}
