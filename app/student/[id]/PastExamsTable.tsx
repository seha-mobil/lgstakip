'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { deleteExamResult, updateExamResult } from '@/app/actions';
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
  const [selectedEditExamId, setSelectedEditExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openEdit = (ex: any) => {
    const subjects = ['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'].map(key => {
      const sub = ex.subjects.find((s: any) => s.subjectKey === key);
      return { key, dogru: sub?.dogru || 0, yanlis: sub?.yanlis || 0 };
    });
    setEditData({ id: ex.id, subjects });
    setSelectedEditExamId(ex.id);
  };

  const handleSaveEdit = async () => {
    if (!selectedEditExamId || !editData) return;
    setLoading(true);
    try {
      await updateExamResult(studentId, selectedEditExamId, editData);
      setSelectedEditExamId(null);
    } catch (err) {
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAnalysis = (e: React.MouseEvent, examId: string) => {
    setSelectedExamId(examId);
    setPopupPos({ top: 0, left: 0 }); // Reset to center
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <style>{`
        .exam-cell { transition: all 0.2s; position: relative; }
        .exam-cell:hover { background: rgba(255,255,255,0.03); color: var(--accent) !important; padding-left: 12px !important; }
        .exam-cell .chart-icon { opacity: 0; transform: translateX(-5px); transition: all 0.2s; color: var(--accent); margin-right: 6px; font-size: 10px; }
        .exam-cell:hover .chart-icon { opacity: 1; transform: translateX(0); }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        {/* ... */}
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
            <th style={{ padding: '12px 8px' }}>Tarih</th>
            <th style={{ padding: '12px 8px' }}>Deneme Adı</th>
            {/* ... */}
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
                  className="exam-cell"
                  style={{ padding: '12px 8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}
                  onClick={(e) => handleOpenAnalysis(e, ex.id)}
                >
                  <i className="fas fa-chart-simple chart-icon"></i>
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
                <td style={{ padding: '12px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => openEdit(ex)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}>
                    <i className="fas fa-edit"></i>
                  </button>
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

      {mounted && selectedExamId && createPortal(
        <>
          <div 
            style={{ 
                position: 'fixed', inset: 0, 
                background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }} 
            onClick={() => setSelectedExamId(null)}
          >
            <div style={{
                    width: '100%', maxWidth: '1000px', height: 'auto', maxHeight: '90vh', zIndex: 10001,
                    boxShadow: '0 40px 100px rgba(0,0,0,1)',
                    border: '1px solid var(--accent)',
                    padding: '40px',
                    overflowY: 'auto',
                    position: 'relative' // to center close button
                }} className="glass-card animate-fade-up" onClick={(e) => e.stopPropagation()}>

                <button 
                    onClick={() => setSelectedExamId(null)}
                    style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '32px', zIndex: 10 }}
                >
                    <i className="fas fa-times"></i>
                </button>
              
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>Deneme Analizi & Karşılaştırma</div>
                <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>{exams.find(e => e.id === selectedExamId)?.trialExam.name}</div>
              </div>
              
              <div style={{ height: '450px', width: '100%', marginBottom: '10px' }}>
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

              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', color: 'var(--text2)', textAlign: 'center' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px', color: 'var(--accent)' }}></i>
                Bu grafik, mevcut sınavdaki netlerinizi **tüm sınavlarınızın ortalaması** ile karşılaştırır.
              </div>
          </div>
        </>,
        document.body
      )}

      {/* Edit Modal */}
      {selectedEditExamId && editData && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000 }} onClick={() => setSelectedEditExamId(null)}></div>
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            zIndex: 10001, boxShadow: '0 30px 60px rgba(0,0,0,0.9)', border: '1px solid var(--accent)',
            padding: '24px'
          }} className="glass-card animate-fade-up">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Deneme Düzenle</div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{exams.find(e => e.id === selectedEditExamId)?.trialExam.name}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {editData.subjects.map((sub: any, idx: number) => (
                  <div key={sub.key} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text2)' }}>{['Türkçe', 'İnkılap', 'Din', 'İngilizce', 'Matematik', 'Fen'][idx]}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Doğru</div>
                        <input type="number" className="input" style={{ padding: '6px' }} value={sub.dogru} 
                          onChange={e => {
                            const newSubs = [...editData.subjects];
                            newSubs[idx].dogru = Number(e.target.value);
                            setEditData({...editData, subjects: newSubs});
                          }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Yanlış</div>
                        <input type="number" className="input" style={{ padding: '6px' }} value={sub.yanlis} 
                          onChange={e => {
                            const newSubs = [...editData.subjects];
                            newSubs[idx].yanlis = Number(e.target.value);
                            setEditData({...editData, subjects: newSubs});
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button onClick={() => setSelectedEditExamId(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Vazgeç</button>
              </div>
          </div>
        </>
      )}
    </div>
  );
}
