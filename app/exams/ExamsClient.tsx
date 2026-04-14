'use client';

import { useState, useRef } from 'react';
import { updateTrialExam, deleteTrialExam, createStandaloneTrialExam, importExcelData } from '@/app/actions';

export default function ExamsClient({ initialExams }: { initialExams: any[] }) {
  const [exams, setExams] = useState(initialExams);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        if (!bstr) return;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        await importExcelData(data);
        alert('Excel verileri başarıyla sisteme aktarıldı! (Değişiklikleri görmek için sayfayı yenileyiniz)');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      alert('Dosya yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const startEdit = (exam: any) => {
    setEditingId(exam.id);
    setEditName(exam.name);
    setEditDate(exam.date ? new Date(exam.date).toISOString().split('T')[0] : '');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    const newExam = await createStandaloneTrialExam(newName, newDate);
    // Add to top of list with count 0
    setExams([{ ...newExam, _count: { examResults: 0 } }, ...exams]);
    setNewName('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setLoading(false);
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
    <>
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Yeni Deneme Ekle</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="input-label">Deneme Adı</label>
            <input type="text" className="input" placeholder="Örn: Özdebir TG-2" value={newName} onChange={e => setNewName(e.target.value)} required disabled={loading} />
          </div>
          <div style={{ flex: '0 0 150px' }}>
            <label className="input-label">Tarih</label>
            <input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px', padding: '0 20px' }}>
            <i className="fas fa-plus"></i> Ekle
          </button>
        </form>
        
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Excel'den Toplu Kayıt</h4>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Öğrenci isimleri ve branş netlerini içeren .xlsx doyasını sisteme topluca yükleyin.</p>
          </div>
          <input 
            type="file" 
            accept=".xls,.xlsx" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={loading}
          >
            <i className="fas fa-file-excel"></i> Dosya Seç
          </button>
        </div>
      </div>

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
    </>
  );
}
