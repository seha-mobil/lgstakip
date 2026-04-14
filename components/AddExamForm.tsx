import { useState, useMemo } from 'react';
import { saveExamResult } from '@/app/actions';
import VisionScanner from './VisionScanner';
import { useRouter } from 'next/navigation';

const SUBJECTS = [
  { key: 'turkce', name: 'Türkçe', questions: 20, coeff: 2.024 },
  { key: 'inkilap', name: 'T.C. İnkılap Tarihi', questions: 10, coeff: 1.018 },
  { key: 'dinkultur', name: 'Din Kültürü', questions: 10, coeff: 0.512 },
  { key: 'ingilizce', name: 'İngilizce', questions: 10, coeff: 0.512 },
  { key: 'matematik', name: 'Matematik', questions: 20, coeff: 3.992 },
  { key: 'fen', name: 'Fen Bilimleri', questions: 20, coeff: 3.992 }
];

const MAX_WEIGHTED = 220.58;
const LGS_MIN = 180;
const LGS_MAX = 500;

export default function AddExamForm({ studentId, trialExams }: { studentId: string, trialExams: any[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [trialExamId, setTrialExamId] = useState(trialExams[0]?.id || 'NEW');
  const [newTrialName, setNewTrialName] = useState('');
  const [date, setDate] = useState(() => {
    if (trialExams[0]?.date) return new Date(trialExams[0].date).toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
  });
  const [ogrenciSayisi, setOgrenciSayisi] = useState(0);
  const [basariSirasi, setBasariSirasi] = useState(0);
  
  const [subjects, setSubjects] = useState(
    SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub.key]: { dogru: 0, yanlis: 0 } }), {} as Record<string, { dogru: number, yanlis: number }>)
  );

  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    let tD = 0, tY = 0, w = 0;
    SUBJECTS.forEach(s => {
      const d = subjects[s.key].dogru;
      const y = subjects[s.key].yanlis;
      const net = Math.max(0, d - (y / 4));
      tD += d;
      tY += y;
      w += net * s.coeff;
    });

    const net = Math.round((tD - tY / 4) * 100) / 100;
    const lgs = Math.round(((w / MAX_WEIGHTED) * (LGS_MAX - LGS_MIN) + LGS_MIN) * 100) / 100;
    
    return { lgs, net, tD, tY };
  }, [subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trialExamId === 'NEW' && !newTrialName.trim()) {
      alert("Lütfen yeni deneme adını giriniz.");
      return;
    }
    setLoading(true);
    
    const payload = {
      trialExamId,
      newTrialName,
      date,
      ogrenciSayisi,
      basariSirasi,
      toplamNet: stats.net,
      lgsPuani: stats.lgs,
      subjects: SUBJECTS.map(s => ({
        key: s.key,
        dogru: subjects[s.key].dogru,
        yanlis: subjects[s.key].yanlis
      }))
    };

    await saveExamResult(studentId, payload);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
        <button 
          type="button"
          onClick={() => setMode('manual')}
          style={{ 
            padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
            background: mode === 'manual' ? 'var(--accent)' : 'transparent',
            color: mode === 'manual' ? '#000' : 'var(--text3)',
            transition: 'all 0.2s'
          }}>
          <i className="fas fa-keyboard" style={{ marginRight: '8px' }}></i> Manuel Giriş
        </button>
        <button 
          type="button"
          onClick={() => setMode('ai')}
          style={{ 
            padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
            background: mode === 'ai' ? 'var(--accent)' : 'transparent',
            color: mode === 'ai' ? '#000' : 'var(--text3)',
            transition: 'all 0.2s'
          }}>
          <i className="fas fa-robot" style={{ marginRight: '8px' }}></i> Yapay Zeka (AI Flash)
        </button>
      </div>

      {mode === 'ai' ? (
        <div className="glass-card animate-fade-up" style={{ padding: '30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Saniyeler İçinde Aktarın</h3>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Deneme sonuç kağıdının fotoğrafını yükleyin, verileri biz çıkaralım.</p>
          </div>
          <VisionScanner studentId={studentId} onSuccess={() => router.push(`/student/${studentId}`)} />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="glass-card animate-fade-up" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label className="input-label">Tarih</label>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">Mevcut Denemelerden Seç</label>
                <select className="input" value={trialExamId} onChange={e => {
                  const val = e.target.value;
                  setTrialExamId(val);
                  if (val !== 'NEW') {
                    const selected = trialExams.find(t => t.id === val);
                    if (selected && selected.date) {
                      setDate(new Date(selected.date).toISOString().split('T')[0]);
                    }
                  }
                }}>
                  <option value="NEW">+ Yeni Deneme Ekle</option>
                  {trialExams.map(te => <option key={te.id} value={te.id}>{te.name} {te.date ? "(" + new Date(te.date).toLocaleDateString('tr-TR') + ")" : ''}</option>)}
                </select>
              </div>
              {trialExamId === 'NEW' && (
                <div>
                  <label className="input-label">Yeni Deneme Adı / Yayın</label>
                  <input type="text" className="input" placeholder="Örn: Özdebir TG-1" value={newTrialName} onChange={e => setNewTrialName(e.target.value)} required />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {SUBJECTS.map((sub, i) => {
              const d = subjects[sub.key].dogru;
              const y = subjects[sub.key].yanlis;
              const net = Math.max(0, d - (y / 3)); // Updated to 3-wrong rule per user feedback
              const p = (net / sub.questions) * 100;
              return (
                <div key={sub.key} className="glass-card animate-fade-up" style={{ padding: '16px', animationDelay: (i * 0.05) + "s" }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{sub.name}</span>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '20px', fontFamily: 'var(--mono)' }}>{sub.questions} Soru</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label className="input-label">Doğru</label>
                      <input type="number" min="0" max={sub.questions} className="input" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 800, fontFamily: 'var(--mono)' }}
                        value={d || ''} 
                        onChange={e => {
                          const nd = Number(e.target.value);
                          if (nd + y > sub.questions) setSubjects(s => ({ ...s, [sub.key]: { dogru: nd, yanlis: Math.max(0, sub.questions - nd) } }));
                          else setSubjects(s => ({ ...s, [sub.key]: { ...s[sub.key], dogru: nd } }));
                        }} onFocus={e => e.target.select()} />
                    </div>
                    <div>
                      <label className="input-label">Yanlış</label>
                      <input type="number" min="0" max={sub.questions} className="input" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 800, fontFamily: 'var(--mono)' }}
                        value={y || ''} 
                        onChange={e => {
                          const ny = Number(e.target.value);
                          if (d + ny > sub.questions) setSubjects(s => ({ ...s, [sub.key]: { yanlis: ny, dogru: Math.max(0, sub.questions - ny) } }));
                          else setSubjects(s => ({ ...s, [sub.key]: { ...s[sub.key], yanlis: ny } }));
                        }} onFocus={e => e.target.select()} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text3)' }}>
                    <span>Net: <b style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{net.toFixed(2)}</b></span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width: p + "%", background: p >= 75 ? 'var(--green)' : p >= 50 ? 'var(--accent)' : 'var(--red)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card animate-fade-up" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div className="sec-title">Sıralama Bilgileri (Opsiyonel)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="input-label">Öğrenci Sayısı</label>
                    <input type="number" min="0" className="input" value={ogrenciSayisi || ''} onChange={e => setOgrenciSayisi(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="input-label">Başarı Sırası</label>
                    <input type="number" min="0" className="input" value={basariSirasi || ''} onChange={e => setBasariSirasi(Number(e.target.value))} />
                  </div>
                </div>
              </div>
              
              <div style={{ width: '100%', maxWidth: '300px' }}>
                <div className="sec-title">Hesaplanan Sonuç</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'var(--mono)', marginBottom: '4px' }}>LGS Puanı</div>
                  <div style={{ fontSize: '44px', fontWeight: 900, letterSpacing: '-1.5px', color: stats.lgs >= 400 ? 'var(--green)' : 'var(--accent)' }}>{stats.lgs.toFixed(2)}</div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Toplam Net: <b style={{ color: 'var(--text)' }}>{(stats.tD - stats.tY / 3).toFixed(2)}</b></span>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '20px', fontSize: '16px' }}>
              <i className="fas fa-save"></i> 
              {loading ? "Kaydediliyor..." : "Denemeyi Kaydet"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
