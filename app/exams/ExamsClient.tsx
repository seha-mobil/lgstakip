'use client';

import { useState } from 'react';
import { updateTrialExam, deleteTrialExam } from '@/app/actions';

export default function ExamsClient({ initialExams }: { initialExams: any[] }) {
  const [exams, setExams] = useState(initialExams);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [loading, setLoading] = useState(false);

  const startEdit = (exam: any) => {
    setEditingId(exam.id);
    setEditName(exam.name);
    setEditDate(exam.date ? new Date(exam.date).toISOString().split('T')[0] : '');
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    const targetDate = editDate || new Date().toISOString().split('T')[0];
    await updateTrialExam(id, { name: editName, date: targetDate });
    
    setExams(prev => prev.map(e => e.id === id ? { ...e, name: editName, date: new Date(targetDate) } : e));
    setEditingId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      if (!confirm(`Bu denemeye ait ${count} öğrenci sonucu var. Denemeyi silerseniz öğrencilerin bu denemedeki tüm sonuçları (netler/puanlar) KALICI OLARAK SİLİNECEK! Emin misiniz?`)) return;
    } else {
      if (!confirm("Bu denemeyi silmek istediğinize emin misiniz?")) return;
    }
    
    setLoading(true);
    await deleteTrialExam(id);
    setExams(prev => prev.filter(e => e.id !== id));
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
              <th style={{ padding: '12px 16px' }}>Tarih</th>
              <th style={{ padding: '12px 16px' }}>Deneme Adı</th>
              <th style={{ padding: '12px 16px' }}>Kayıtlı Sonuç</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>Kayıtlı deneme bulunmuyor.</td>
              </tr>
            ) : exams.map((ex) => (
              <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {editingId === ex.id ? (
                  <>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="date" className="input" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ padding: '6px 10px' }} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '6px 10px' }} />
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text3)' }}>{ex._count.examResults}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                       <button onClick={() => handleSave(ex.id)} disabled={loading} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '6px' }}>
                         Kaydet
                       </button>
                       <button onClick={() => setEditingId(null)} disabled={loading} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                         İptal
                       </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>
                      {ex.date ? new Date(ex.date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{ex.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontFamily: 'var(--mono)' }}>
                        {ex._count.examResults} öğrenci
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => startEdit(ex)} className="btn btn-ghost" style={{ padding: '6px', height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(ex.id, ex._count.examResults)} disabled={loading} className="delete-btn" style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '6px', borderRadius: '4px', height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
