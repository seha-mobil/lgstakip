'use client';

import { useState } from 'react';

const SUBJECTS = [
  { key: 'turkce', name: 'Türkçe' },
  { key: 'inkilap', name: 'T.C. İnkılap Tarihi' },
  { key: 'dinkultur', name: 'Din Kültürü' },
  { key: 'ingilizce', name: 'İngilizce' },
  { key: 'matematik', name: 'Matematik' },
  { key: 'fen', name: 'Fen Bilimleri' }
];

export default function CompareExamsClient({ exams, studentColor }: { exams: any[], studentColor: string }) {
  const [exam1Id, setExam1Id] = useState(exams[exams.length - 2].id);
  const [exam2Id, setExam2Id] = useState(exams[exams.length - 1].id);

  const e1 = exams.find(e => e.id === exam1Id);
  const e2 = exams.find(e => e.id === exam2Id);

  if (!e1 || !e2) return null;

  return (
    <div>
      <div className="glass-card animate-fade-up" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="input-label">1. Deneme</label>
            <select className="input" value={exam1Id} onChange={e => setExam1Id(e.target.value)}>
              {exams.map(e => <option key={e.id} value={e.id}>{e.trialExam.name} ({new Date(e.date).toLocaleDateString('tr-TR')})</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">2. Deneme</label>
            <select className="input" value={exam2Id} onChange={e => setExam2Id(e.target.value)}>
              {exams.map(e => <option key={e.id} value={e.id}>{e.trialExam.name} ({new Date(e.date).toLocaleDateString('tr-TR')})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card animate-fade-up" style={{ padding: '24px', animationDelay: '0.1s' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Ders</th>
              <th style={{ padding: '12px' }}>1. Deneme Neti</th>
              <th style={{ padding: '12px' }}>2. Deneme Neti</th>
              <th style={{ padding: '12px' }}>Fark</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map(sub => {
              const s1 = e1.subjects.find((s:any) => s.subjectKey === sub.key);
              const s2 = e2.subjects.find((s:any) => s.subjectKey === sub.key);
              const net1 = s1 ? Math.max(0, s1.dogru - (s1.yanlis / 4)) : 0;
              const net2 = s2 ? Math.max(0, s2.dogru - (s2.yanlis / 4)) : 0;
              const diff = net2 - net1;

              return (
                <tr key={sub.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>{sub.name}</td>
                  <td style={{ padding: '12px', fontFamily: 'var(--mono)' }}>{net1}</td>
                  <td style={{ padding: '12px', fontFamily: 'var(--mono)' }}>{net2}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text3)' }}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 800 }}>TOPLAM NET</td>
              <td style={{ padding: '16px 12px', fontFamily: 'var(--mono)', fontWeight: 800 }}>{e1.toplamNet}</td>
              <td style={{ padding: '16px 12px', fontFamily: 'var(--mono)', fontWeight: 800 }}>{e2.toplamNet}</td>
              <td style={{ padding: '16px 12px', fontWeight: 900, fontSize: '15px', color: (e2.toplamNet - e1.toplamNet) > 0 ? 'var(--green)' : (e2.toplamNet - e1.toplamNet) < 0 ? 'var(--red)' : 'var(--text3)' }}>
                {(e2.toplamNet - e1.toplamNet) > 0 ? '+' : ''}{(e2.toplamNet - e1.toplamNet).toFixed(2)}
              </td>
            </tr>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 800, color: studentColor }}>LGS PUANI</td>
              <td style={{ padding: '16px 12px', fontFamily: 'var(--mono)', fontWeight: 800 }}>{e1.lgsPuani.toFixed(2)}</td>
              <td style={{ padding: '16px 12px', fontFamily: 'var(--mono)', fontWeight: 800 }}>{e2.lgsPuani.toFixed(2)}</td>
              <td style={{ padding: '16px 12px', fontWeight: 900, fontSize: '18px', color: (e2.lgsPuani - e1.lgsPuani) > 0 ? 'var(--green)' : (e2.lgsPuani - e1.lgsPuani) < 0 ? 'var(--red)' : 'var(--text3)' }}>
                {(e2.lgsPuani - e1.lgsPuani) > 0 ? '+' : ''}{(e2.lgsPuani - e1.lgsPuani).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
