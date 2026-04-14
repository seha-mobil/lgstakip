'use client';

import { useState } from 'react';
import { deleteExamResult } from '@/app/actions';
import { SubjectComparisonMiniChart } from '@/components/ClientCharts';

export default function PastExamsTable({ 
  exams, 
  studentId, 
  studentColor,
  averages 
}: { 
  exams: any[], 
  studentId: string, 
  studentColor: string,
  averages: Record<string, Record<string, number>>
}) {
  const [hoveredExamId, setHoveredExamId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{ overflowX: 'auto', position: 'relative' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
            <th style={{ padding: '12px 8px' }}>Tarih</th>
            <th style={{ padding: '12px 8px' }}>Deneme Adı</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>TR</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>İNK</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>DİN</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>İNG</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>MAT</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>FEN</th>
            <th style={{ padding: '12px 8px' }}>Top. Net</th>
            <th style={{ padding: '12px 8px' }}>Puan</th>
            <th style={{ padding: '12px 8px' }}>Fark</th>
            <th style={{ padding: '12px 8px', textAlign: 'right' }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {[...exams].reverse().map((ex) => {
            const currentIndexInOriginal = exams.findIndex(e => e.id === ex.id);
            const prevLgs = currentIndexInOriginal > 0 ? exams[currentIndexInOriginal - 1].lgsPuani : null;
            const diff = prevLgs ? ex.lgsPuani - prevLgs : 0;
            
            // Prepare student nets for the chart
            const studentNets: Record<string, number> = {};
            ex.subjects.forEach((s: any) => {
                studentNets[s.subjectKey] = Math.max(0, s.dogru - (s.yanlis / 4));
            });

            const avgNets = averages[ex.trialExamId] || {};

            return (
              <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', color: 'var(--text2)' }}>{new Date(ex.date).toLocaleDateString('tr-TR')}</td>
                <td 
                  style={{ padding: '12px 8px', fontWeight: 600, cursor: 'help', color: 'var(--accent)' }}
                  onMouseEnter={() => setHoveredExamId(ex.id)}
                  onMouseLeave={() => setHoveredExamId(null)}
                  onMouseMove={handleMouseMove}
                >
                  {ex.trialExam.name}
                </td>
                {['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'].map(key => {
                  const sub = ex.subjects?.find((s:any) => s.subjectKey === key);
                  const net = sub ? Math.max(0, sub.dogru - (sub.yanlis / 4)) : 0;
                  return <td key={key} style={{ padding: '12px 8px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text2)' }}>{net}</td>;
                })}
                <td style={{ padding: '12px 8px', fontFamily: 'var(--mono)' }}>{ex.toplamNet}</td>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: ex.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{ex.lgsPuani.toFixed(2)}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                  {prevLgs ? (
                    <span style={{ color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text3)' }}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </span>
                  ) : '-'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                  <form action={deleteExamResult.bind(null, studentId, ex.id)} style={{ display: 'inline-block' }}>
                    <button type="submit" className="delete-btn" style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {hoveredExamId && (
        <div style={{
          position: 'fixed',
          top: mousePos.y + 20,
          left: mousePos.x + 20,
          width: '280px',
          height: '180px',
          zIndex: 1000,
          pointerEvents: 'none'
        }} className="glass-card animate-fade-up">
           <div style={{ padding: '12px', height: '100%' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Net Karşılaştırması
              </div>
              <div style={{ height: 'calc(100% - 20px)' }}>
                <SubjectComparisonMiniChart 
                  studentNets={
                    (() => {
                        const ex = exams.find(e => e.id === hoveredExamId);
                        const nets: Record<string, number> = {};
                        ex?.subjects.forEach((s: any) => {
                            nets[s.subjectKey] = Math.max(0, s.dogru - (s.yanlis / 4));
                        });
                        return nets;
                    })()
                  }
                  avgNets={averages[exams.find(e => e.id === hoveredExamId)?.trialExamId || ''] || {}}
                  color={studentColor}
                />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
