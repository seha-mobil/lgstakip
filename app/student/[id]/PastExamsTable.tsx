'use client';

import React, { useState, useEffect } from 'react';
import { deleteExamResult, updateExamResult } from '@/app/actions';
import ExamAnalysisModal from '@/components/ExamAnalysisModal';

export default function PastExamsTable({ 
  student,
  exams, 
  studentId, 
  studentColor,
  personalAverages 
}: { 
  student: any,
  exams: any[], 
  studentId: string, 
  studentColor: string,
  personalAverages: Record<string, number>
}) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedEditExamId, setSelectedEditExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
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

  const handleOpenAnalysis = (examId: string) => {
    setSelectedExamId(examId);
  };

  // Find the selected exam and its previous exam for the modal
  const selectedExam = exams.find(e => e.id === selectedExamId);
  const currentIndexInOriginal = selectedExam ? exams.findIndex(e => e.id === selectedExamId) : -1;
  const prevExam = (currentIndexInOriginal > 0) ? exams[currentIndexInOriginal - 1] : null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <style>{`
        .exam-cell { transition: all 0.2s; position: relative; }
        .exam-cell:hover { background: rgba(255,255,255,0.03); color: var(--accent) !important; padding-left: 12px !important; }
        .exam-cell .chart-icon { opacity: 0; transform: translateX(-5px); transition: all 0.2s; color: var(--accent); margin-right: 6px; font-size: 10px; }
        .exam-cell:hover .chart-icon { opacity: 1; transform: translateX(0); }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
            <th style={{ padding: '12px 8px' }}>Tarih</th>
            <th style={{ padding: '12px 8px' }}>Deneme Adı</th>
            {['TR', 'İNK', 'DİN', 'İNG', 'MAT', 'FEN'].map(h => (
              <th key={h} style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>{h}</th>
            ))}
            <th style={{ padding: '12px 8px' }}>Top. Net</th>
            <th style={{ padding: '12px 8px' }}>Puan</th>
            <th style={{ padding: '12px 8px' }}>Fark</th>
            <th style={{ padding: '12px 8px', textAlign: 'right' }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {[...exams].reverse().map((ex) => {
            const currentIdx = exams.findIndex(e => e.id === ex.id);
            const prevLgs = currentIdx > 0 ? exams[currentIdx - 1].lgsPuani : null;
            const diff = prevLgs ? ex.lgsPuani - prevLgs : 0;
            
            return (
              <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedExamId === ex.id ? 'var(--accent-dim)' : 'transparent' }}>
                <td style={{ padding: '12px 8px', color: 'var(--text2)' }}>{new Date(ex.date).toLocaleDateString('tr-TR')}</td>
                <td 
                  className="exam-cell"
                  style={{ padding: '12px 8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}
                  onClick={() => handleOpenAnalysis(ex.id)}
                >
                  <i className="fas fa-chart-simple chart-icon"></i>
                  {ex.trialExam.name}
                </td>
                {['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'].map(key => {
                  const sub = ex.subjects?.find((s:any) => s.subjectKey === key);
                  const net = sub ? Math.max(0, sub.dogru - (sub.yanlis / 3)) : 0;
                  const formattedNet = net % 1 === 0 ? net : net.toFixed(2).replace('.', ',');
                  return <td key={key} style={{ padding: '12px 8px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text2)' }}>{formattedNet}</td>;
                })}
                <td style={{ padding: '12px 8px', fontFamily: 'var(--mono)' }}>{String(ex.toplamNet).replace('.', ',')}</td>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: ex.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{ex.lgsPuani.toFixed(2).replace('.', ',')}</td>
                <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                  {prevLgs ? (
                    <span style={{ color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text3)' }}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2).replace('.', ',')}
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

      {/* NEW SMART REPORT CARD MODAL */}
      {mounted && selectedExam && (
        <ExamAnalysisModal 
            isOpen={!!selectedExam}
            onClose={() => setSelectedExamId(null)}
            student={student}
            exam={selectedExam}
            prevExam={prevExam}
            targetPuan={student.targetLisePuan}
            studentColor={studentColor}
            isAverage={false}
            mode="notes"
        />
      )}

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
                        <input type="number" style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px' }} value={sub.dogru} 
                          onChange={e => {
                            const newSubs = [...editData.subjects];
                            newSubs[idx].dogru = Number(e.target.value);
                            setEditData({...editData, subjects: newSubs});
                          }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Yanlış</div>
                        <input type="number" style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px' }} value={sub.yanlis} 
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
                  style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button onClick={() => setSelectedEditExamId(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>Vazgeç</button>
              </div>
          </div>
        </>
      )}
    </div>
  );
}
