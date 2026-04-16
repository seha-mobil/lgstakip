'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Constant Data for Subjects and Units
const SUBJECT_DATA = [
  { id: "mat", name: "Matematik", icon: "fa-calculator", color: "#6366f1", units: ["Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler", "Veri Analizi", "Olasılık", "Cebirsel İfadeler"] },
  { id: "tur", name: "Türkçe", icon: "fa-book", color: "#10b981", units: ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları", "Noktalama İşaretleri", "Fiilimsiler"] },
  { id: "fen", name: "Fen Bilimleri", icon: "fa-flask", color: "#f59e0b", units: ["Mevsimler ve İklim", "DNA ve Genetik Kod", "Basınç", "Madde ve Endüstri"] },
  { id: "ing", name: "İngilizce", icon: "fa-language", color: "#3b82f6", units: ["Friendship", "Teen Life", "In the Kitchen", "On the Phone"] },
  { id: "ink", name: "İnkılap Tarihi", icon: "fa-history", color: "#ef4444", units: ["Bir Kahraman Doğuyor", "Milli Uyanış", "Milli Bir Destan"] },
  { id: "din", name: "Din Kültürü", icon: "fa-star-and-crescent", color: "#8b5cf6", units: ["Kader İnancı", "Zekat ve Sadaka", "Din ve Hayat"] }
];

const EXAM_DATE = new Date("2026-06-06");
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function DersPlani() {
  const [state, setState] = useState<any>(null);
  const [countdown, setCountdown] = useState({ days: 0, weeks: 0 });
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isSolveModalOpen, setSolveModalOpen] = useState(false);
  const [currentSolve, setCurrentSolve] = useState<any>(null);
  const [solveData, setSolveData] = useState({ correct: 0, wrong: 0 });
  const [newGoal, setNewGoal] = useState("");
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  // Initialize and Load Progress
  useEffect(() => {
    const saved = localStorage.getItem("lgs_premium_v3");
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      setState({
        units: {},
        goals: [],
        weekly: { correct: [0, 0, 0, 0, 0, 0, 0], wrong: [0, 0, 0, 0, 0, 0, 0] },
        nets: [],
        streak: 0,
        lastSolveDate: null
      });
    }

    // Countdown logic
    const updateCountdown = () => {
      const diff = EXAM_DATE.getTime() - new Date().getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setCountdown({ days, weeks: Math.floor(days / 7) });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save State
  useEffect(() => {
    if (state) {
      localStorage.setItem("lgs_premium_v3", JSON.stringify(state));
    }
  }, [state]);

  if (!state) return null;

  // Actions
  const toggleSubject = (id: string) => {
    setOpenSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openSolve = (sid: string, ui: number) => {
    const subject = SUBJECT_DATA.find(x => x.id === sid);
    setCurrentSolve({ sid, ui, subjectName: subject?.name, unitName: subject?.units[ui] });
    setSolveData({ correct: 0, wrong: 0 });
    setSolveModalOpen(true);
  };

  const saveSolve = () => {
    const { correct, wrong } = solveData;
    if (correct + wrong > 0) {
      const newState = { ...state };
      const key = `${currentSolve.sid}_${currentSolve.ui}`;
      if (!newState.units[key]) newState.units[key] = { correct: 0, wrong: 0 };
      newState.units[key].correct += correct;
      newState.units[key].wrong += wrong;

      const today = new Date().toDateString();
      if (newState.lastSolveDate !== today) {
        newState.streak++;
        newState.lastSolveDate = today;
      }

      const dayIdx = [6, 0, 1, 2, 3, 4, 5][new Date().getDay()];
      newState.weekly.correct[dayIdx] += correct;
      newState.weekly.wrong[dayIdx] += wrong;

      setState(newState);
    }
    setSolveModalOpen(false);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const newState = { ...state };
    newState.goals.push({ id: Date.now(), text: newGoal.trim(), done: false });
    setState(newState);
    setNewGoal("");
    setGoalModalOpen(false);
  };

  const toggleGoal = (id: number) => {
    const newState = { ...state };
    newState.goals = newState.goals.map((g: any) => g.id === id ? { ...g, done: !g.done } : g);
    setState(newState);
  };

  const deleteGoal = (id: number) => {
    const newState = { ...state };
    newState.goals = newState.goals.filter((g: any) => g.id !== id);
    setState(newState);
  };

  // Stats Calculations
  let totalSolved = 0, totalCorrect = 0, totalWrong = 0;
  Object.values(state.units).forEach((u: any) => {
    totalCorrect += u.correct;
    totalWrong += u.wrong;
  });
  totalSolved = totalCorrect + totalWrong;
  const totalNet = totalSolved ? (totalCorrect - (totalWrong / 3)).toFixed(2) : "0";
  const globalAcc = totalSolved ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  return (
    <div className="page animate-fade-up">
      {/* Header */}
      <div className="flex-mobile-col" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Ders Planı & Analiz</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 500 }}>Premium Başarı Paneli</p>
          </div>
        </div>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
          2026 SINAV DÖNEMİ
        </div>
      </div>

      {/* Countdown Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--accent-dim) 0%, transparent 100%)' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 600, marginBottom: '4px' }}>LGS Sınavına Kalan Süre</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>{countdown.days}</span>
            <span style={{ fontWeight: 700, color: 'var(--text3)', fontSize: '0.9rem' }}>GÜN</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{countdown.weeks} Hafta</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Hedefine her gün bir adım daha yaklaş!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-desktop-4" style={{ gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Toplam Soru</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalSolved}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Genel Net</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{totalNet}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Başarı Oranı</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>%{globalAcc}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Çalışma Serisi</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{state.streak} Gün</p>
        </div>
      </div>

      <div className="flex-mobile-col" style={{ gap: '24px' }}>
        {/* Subject List */}
        <div style={{ flex: 1.6 }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px' }}>Ders ve Ünite Analizi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SUBJECT_DATA.map(s => {
                let sc = 0, sw = 0;
                s.units.forEach((_, i) => {
                  const u = state.units[`${s.id}_${i}`] || { correct: 0, wrong: 0 };
                  sc += u.correct; sw += u.wrong;
                });
                const total = sc + sw;
                const pct = total ? Math.round((sc / total) * 100) : 0;
                const isOpen = openSubjects[s.id];

                return (
                  <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    <div 
                      onClick={() => toggleSubject(s.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 10px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s' }}
                      className="hover-bg"
                    >
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }}></div>
                      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 700 }}>{s.name}</span>
                      <div style={{ width: '80px', height: '6px', background: 'var(--card-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: s.color, transition: 'width 0.6s' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, width: '35px', textAlign: 'right' }}>%{pct}</span>
                      <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '10px', color: 'var(--text3)' }}></i>
                    </div>
                    
                    {isOpen && (
                      <div style={{ padding: '8px 12px 12px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {s.units.map((u, i) => {
                          const ud = state.units[`${s.id}_${i}`] || { correct: 0, wrong: 0 };
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                              <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{u}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#3dd68c', fontWeight: 700 }}>{ud.correct}D</span>
                                <span style={{ color: '#f43f5e', fontWeight: 700 }}>{ud.wrong}Y</span>
                                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => openSolve(s.id, i)}>
                                  Giriş
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div style={{ flex: 1 }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Günlük Hedefler</h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '10px' }}>
                {state.goals.filter((g: any) => g.done).length}/{state.goals.length}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {state.goals.map((g: any) => (
                <div key={g.id} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div 
                    onClick={() => toggleGoal(g.id)}
                    style={{ 
                      width: '20px', height: '20px', borderRadius: '6px', border: '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: g.done ? 'var(--accent)' : 'transparent', borderColor: g.done ? 'var(--accent)' : 'var(--border)'
                    }}
                  >
                    {g.done && <i className="fas fa-check" style={{ fontSize: '10px', color: 'white' }}></i>}
                  </div>
                  <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: g.done ? 'var(--text3)' : 'var(--text)', textDecoration: g.done ? 'line-through' : 'none' }}>
                    {g.text}
                  </span>
                  <button onClick={() => deleteGoal(g.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', opacity: 0.6, cursor: 'pointer' }}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              {state.goals.length === 0 && (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text3)', padding: '20px' }}>Henüz hedef eklenmemiş.</p>
              )}
            </div>
            
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setGoalModalOpen(true)}>
              <i className="fas fa-plus"></i> Yeni Hedef Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isGoalModalOpen && (
        <div className="modal-overlay open" onClick={() => setGoalModalOpen(false)}>
          <div className="glass-card animate-fade-up" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontWeight: 800 }}>Yeni Hedef</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase' }}>Hedef Açıklaması</label>
              <input 
                type="text" 
                className="input" 
                value={newGoal} 
                onChange={e => setNewGoal(e.target.value)} 
                placeholder="Örn: 50 Matematik sorusu..." 
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setGoalModalOpen(false)}>İptal</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addGoal}>Ekle</button>
            </div>
          </div>
        </div>
      )}

      {isSolveModalOpen && (
        <div className="modal-overlay open" onClick={() => setSolveModalOpen(false)}>
          <div className="glass-card animate-fade-up" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>{currentSolve?.subjectName}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentSolve?.unitName}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase' }}>Doğru</label>
                <input 
                  type="number" 
                  className="input" 
                  value={solveData.correct} 
                  onChange={e => setSolveData({ ...solveData, correct: parseInt(e.target.value) || 0 })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase' }}>Yanlış</label>
                <input 
                  type="number" 
                  className="input" 
                  value={solveData.wrong} 
                  onChange={e => setSolveData({ ...solveData, wrong: parseInt(e.target.value) || 0 })} 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSolveModalOpen(false)}>İptal</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveSolve}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-bg:hover {
          background: var(--accent-dim) !important;
        }
      `}</style>
    </div>
  );
}
