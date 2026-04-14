'use client';

import { useState, useRef } from 'react';
import { updateTrialExam, deleteTrialExam, createStandaloneTrialExam, importExcelData } from '@/app/actions';

export default function ExamsClient({ initialExams, students }: { initialExams: any[], students: any[] }) {
  const [activeTab, setActiveTab] = useState<'exams'|'students'>('exams');
  const [exams, setExams] = useState(initialExams);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiMode, setAiMode] = useState<'manual'|'ai'>('manual');
  const [loading, setLoading] = useState(false);
  
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleUpdatePassword = async (studentId: string, currentName: string, currentPass: string) => {
    const newPass = prompt(`${currentName} için yeni şifre girin (Mevcut: ${currentPass}):`);
    if (newPass !== null && newPass.trim()) {
      const { updateStudent } = await import('@/app/actions');
      await updateStudent(studentId, { password: newPass.trim() });
      alert('Şifre başarıyla güncellendi.');
      window.location.reload();
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (confirm(`${studentName} isimli öğrenciyi ve TÜM deneme verilerini silmek istediğinize emin misiniz?`)) {
      const { removeStudent } = await import('@/app/actions');
      await removeStudent(studentId);
      alert('Öğrenci silindi.');
      window.location.reload();
    }
  };

  const handlePasteData = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    try {
      // Satırları \n ile ayır
      const rows = pasteText.split('\n').filter(r => r.trim());
      if (rows.length < 2) {
        alert("Geçersiz veri: Başlıklar ve en az 1 satır veri olmalıdır.");
        setLoading(false);
        return;
      }
      
      // Hücreleri \t (tab) ile ayır
      const headers = rows[0].split('\t').map(h => h.trim());
      const data = [];
      
      for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i].split('\t');
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = rowData[j]?.trim();
        }
        data.push(obj);
      }
      
      await importExcelData(data);
      alert('Veriler başarıyla sisteme aktarıldı! (Değişiklikleri görmek için sayfayı yenileyiniz)');
      setPasteText('');
      setShowPaste(false);
    } catch (err) {
      console.error(err);
      alert('Veriler işlenirken bir hata oluştu');
    }
    setLoading(false);
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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('exams')}
          className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <i className="fas fa-file-invoice"></i> Deneme Tanımları
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <i className="fas fa-user-gear"></i> Öğrenci Yönetimi
        </button>
        <button 
          onClick={() => setActiveTab('lab')}
          className={`btn ${activeTab === 'lab' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <i className="fas fa-flask"></i> AI Laboratuvarı
        </button>
      </div>

      {activeTab === 'exams' && (
        <>
          <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Yeni Deneme Ekle</h3>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border)' }}>
              <button type="button" onClick={() => setAiMode('manual')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none', background: aiMode === 'manual' ? 'var(--accent)' : 'transparent', color: aiMode === 'manual' ? '#000' : 'var(--text3)' }}>Manuel</button>
              <button type="button" onClick={() => setAiMode('ai')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none', background: aiMode === 'ai' ? 'var(--accent)' : 'transparent', color: aiMode === 'ai' ? '#000' : 'var(--text3)' }}>Yapay Zeka</button>
            </div>

            {aiMode === 'ai' ? (
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--accent-glow)' }}>
                <VisionScanner />
              </div>
            ) : (
              <form onSubmit={handleCreate} className="flex-mobile-col" style={{ gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 auto', width: '100%' }}>
                  <label className="input-label">Deneme Adı</label>
                  <input type="text" className="input" placeholder="Örn: Özdebir TG-2" value={newName} onChange={e => setNewName(e.target.value)} required disabled={loading} />
                </div>
                <div style={{ flex: '0 0 auto', width: '100%' }}>
                  <label className="input-label">Tarih</label>
                  <input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} required disabled={loading} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px', padding: '0 20px', width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-plus"></i> Ekle
                </button>
              </form>
            )}
            
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{"Excel'den"} Tablo Kopyala-Yapıştır</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Excelinizdeki sütunları farenizle seçip Kopyalayın (Ctrl+C). Aşağıya Yapıştırarak (Ctrl+V) toplu kayıt edebilirsiniz.</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPaste(!showPaste)} 
                >
                  <i className={`fas fa-chevron-${showPaste ? 'up' : 'down'}`}></i> {showPaste ? 'İptal' : 'Veri Yapıştır'}
                </button>
              </div>
              
              {showPaste && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea 
                    placeholder="Başlıklar ve verileri buraya yapıştırın (CTRL+V)..."
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    style={{ width: '100%', minHeight: '150px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text)', fontSize: '12px', fontFamily: 'monospace' }}
                    disabled={loading}
                  />
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handlePasteData} 
                      disabled={loading || !pasteText.trim()}
                    >
                      {loading ? 'İşleniyor...' : 'Verileri Kaydet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
          <div className="table-container">
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
    )}

    {activeTab === 'students' && (
      <div className="glass-card animate-fade-up" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Öğrenci Yönetimi</h3>
          <button 
            onClick={async () => {
              const { syncDatabaseSchema } = await import('@/app/actions');
              const res = await syncDatabaseSchema();
              if (res.success) alert('Veritabanı başarıyla güncellendi!');
              else alert('Hata: ' + res.error);
            }} 
            className="btn btn-ghost" 
            style={{ fontSize: '11px', color: 'var(--accent)' }}
          >
            <i className="fas fa-database"></i> Veritabanını Güncelle
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {students.map(s => (
            <div key={s.id} className="glass-card flex-mobile-col" style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.02)', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, width: '100%' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color, flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                    Giriş Şifresi: <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 'bold' }}>{s.password}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                <button onClick={() => handleUpdatePassword(s.id, s.name, s.password)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '11px', gap: '6px', flex: 1, justifyContent: 'center' }}>
                  <i className="fas fa-key"></i> Şifre Değiştir
                </button>
                <button onClick={() => handleDeleteStudent(s.id, s.name)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--red)', gap: '6px', flex: 1, justifyContent: 'center' }}>
                  <i className="fas fa-trash"></i> Sil
                </button>
              </div>
            </div>
          ))}
          {students.length === 0 && <div style={{ color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Kayıtlı öğrenci bulunamadı.</div>}
        </div>
      </div>
    )}
    {activeTab === 'lab' && (
      <div className="glass-card animate-fade-up" style={{ padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Yapay Zeka Laboratuvarı</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Burada yapay zeka tarama motorunu test edebilir, optik form okumalarını deneyebilirsiniz.</p>
        </div>
        <VisionScanner />
      </div>
    )}
  </>
  );
}
