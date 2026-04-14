'use client';

import { useState } from 'react';
import { deleteExamResult } from '@/app/actions';
import { SubjectComparisonMiniChart } from '@/components/ClientCharts';

export default function PastExamsTable({ 
  exams, 
  studentId, 
  studentColor,
  personalAverages 
}: { 
  exams: any[], 
  studentId: string, 
  studentColor: string,
  personalAverages: Record<string, number>
}) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  return (
    <div style={{ overflowX: 'auto', position: 'relative' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        {/* ... (thead remains same) ... */}
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
            <th style={{ padding: '12px 8px' }}>Tarih</th>
            <th style={{ padding: '12px 8px' }}>Deneme Adı</th>
            {/* ... other ths ... */}
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
            
            return (
              <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedExamId === ex.id ? 'rgba(232, 184, 75, 0.05)' : 'transparent' }}>
                <td style={{ padding: '12px 8px', color: 'var(--text2)' }}>{new Date(ex.date).toLocaleDateString('tr-TR')}</td>
                <td 
                  style={{ padding: '12px 8px', fontWeight: 600, cursor: 'pointer', color: 'var(--accent)', textDecoration: 'underline' }}
                  onClick={() => setSelectedExamId(selectedExamId === ex.id ? null : ex.id)}
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

      {selectedExamId && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '450px',
          height: '350px',
          zIndex: 1000,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          border: '1px solid var(--accent)'
        }} className="glass-card animate-fade-up">
           <div style={{ padding: '20px', height: '100%', position: 'relative' }}>
              <button 
                onClick={() => setSelectedExamId(null)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px' }}
              >
                <i className="fas fa-times"></i>
              </button>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Deneme Analizi
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>
                  {exams.find(e => e.id === selectedExamId)?.trialExam.name}
                </div>
              </div>
              
              <div style={{ height: 'calc(100% - 70px)' }}>
                <SubjectComparisonMiniChart 
                  studentNets={
                    (() => {
                        const ex = exams.find(e => e.id === selectedExamId);
                        const nets: Record<string, number> = {};
                        ex?.subjects.forEach((s: any) => {
                            nets[s.subjectKey] = Math.max(0, s.dogru - (s.yanlis / 4));
                        });
                        return nets;
                    })()
                  }
                  avgNets={personalAverages}
                  color={studentColor}
                />
              </div>
           </div>
        </div>
      )}
      
      {selectedExamId && (
        <div 
          onClick={() => setSelectedExamId(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999 }}
        ></div>
      )}
    </div>
  );
}
