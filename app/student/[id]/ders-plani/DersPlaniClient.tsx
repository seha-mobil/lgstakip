'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const SUBJECT_DATA = [
  { id: "mat", name: "Matematik", icon: "fa-calculator", color: "#6366f1", units: ["Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler", "Veri Analizi", "Olasılık", "Cebirsel İfadeler"] },
  { id: "tur", name: "Türkçe", icon: "fa-book", color: "#10b981", units: ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları", "Noktalama İşaretleri", "Fiilimsiler"] },
  { id: "fen", name: "Fen Bilimleri", icon: "fa-flask", color: "#f59e0b", units: ["Mevsimler ve İklim", "DNA ve Genetik Kod", "Basınç", "Madde ve Endüstri"] },
  { id: "ing", name: "İngilizce", icon: "fa-language", color: "#3b82f6", units: ["Friendship", "Teen Life", "In the Kitchen", "On the Phone"] },
  { id: "ink", name: "İnkılap Tarihi", icon: "fa-history", color: "#ef4444", units: ["Bir Kahraman Doğuyor", "Milli Uyanış", "Milli Bir Destan"] },
  { id: "din", name: "Din Kültürü", icon: "fa-star-and-crescent", color: "#8b5cf6", units: ["Kader İnancı", "Zekat ve Sadaka", "Din ve Hayat"] }
];

const EXAM_DATE = new Date("2026-06-06");

interface Props {
  studentName: string;
  studentId: string;
  dbExams: any[];
}

export default function DersPlaniClient({ studentName, studentId, dbExams }: Props) {
  const [state, setState] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analiz' | 'planlama'>('analiz');
  const [countdown, setCountdown] = useState({ days: 0, weeks: 0 });
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isSolveModalOpen, setSolveModalOpen] = useState(false);
  const [isStudyModalOpen, setStudyModalOpen] = useState(false);
  
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [solveData, setSolveData] = useState({ correct: 0, wrong: 0 });
  const [newGoal, setNewGoal] = useState("");
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  const [studyMinutes, setStudyMinutes] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const storageKey = `lgs_premium_v3_${studentId}`;

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.history) parsed.history = [];
      if (!parsed.agenda) parsed.agenda = {};
      setState(parsed);
    } else {
      setState({
        units: {},
        goals: [],
        weekly: { correct: [0, 0, 0, 0, 0, 0, 0], wrong: [0, 0, 0, 0, 0, 0, 0] },
        history: [],
        agenda: {},
        streak: 0,
        lastSolveDate: null
      });
    }

    const updateCountdown = () => {
      const diff = EXAM_DATE.getTime() - new Date().getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setCountdown({ days, weeks: Math.floor(days / 7) });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [storageKey]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (timerSeconds > 0 && timerSeconds % 60 === 0) {
      setStudyMinutes(Math.floor(timerSeconds / 60));
    }
  }, [timerSeconds]);

  // Save state
  useEffect(() => {
    if (state) localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Merge History with DB Exams (Filtered for last 7 days)
  const mergedHistory = useMemo(() => {
    if (!state) return [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const combined = [...state.history, ...dbExams];
    return combined
      .filter(event => new Date(event.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state, dbExams]);

  // Generate next 15 days for Agenda
  const agendaDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 15; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        days.push({
            dateKey: d.toISOString().split('T')[0],
            label: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
            dayName: d.toLocaleDateString('tr-TR', { weekday: 'long' }),
            isToday: i === 0
        });
    }
    return days;
  }, []);

  if (!state) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addHistory = (type: string, data: any) => {
    const newState = { ...state };
    newState.history.unshift({
      id: Date.now(),
      type,
      date: new Date().toISOString(),
      ...data
    });
    if (newState.history.length > 100) newState.history = newState.history.slice(0, 100);
    setState(newState);
  };

  const saveSolve = () => {
    const { correct, wrong } = solveData;
    if (correct + wrong > 0) {
      const newState = { ...state };
      const key = `${currentAction.sid}_${currentAction.ui}`;
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
      addHistory('solve', { 
        subject: currentAction.subjectName, 
        unit: currentAction.unitName, 
        correct, 
        wrong 
      });
    }
    setSolveModalOpen(false);
  };

  const saveStudy = () => {
    if (studyMinutes > 0) {
      addHistory('study', {
        subject: currentAction.subjectName,
        unit: currentAction.unitName,
        duration: studyMinutes
      });
    }
    setStudyMinutes(0);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setStudyModalOpen(false);
  };

  const toggleGoal = (id: number) => {
    const newState = { ...state };
    newState.goals = newState.goals.map((g: any) => g.id === id ? { ...g, done: !g.done } : g);
    setState(newState);
  };

  const updateAgenda = (dateKey: string, text: string) => {
    const newState = { ...state };
    newState.agenda[dateKey] = text;
    setState(newState);
  };

  // Stats
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
      <div className="flex-mobile-col" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href={`/student/${studentId}`} className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ders Planı: {studentName}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 500 }}>Premium Gelişim Paneli</p>
          </div>
        </div>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}>
          <i className="fas fa-clock"></i> {countdown.days} GÜN ({countdown.weeks} Hafta)
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        background: 'var(--card-bg)', 
        padding: '6px', 
        borderRadius: '14px', 
        border: '1px solid var(--border)',
        maxWidth: 'fit-content'
      }}>
        {[
          { id: 'analiz', label: 'Analiz & Durum', icon: 'fa-chart-pie' },
          { id: 'planlama', label: 'Ajanda & Planlama', icon: 'fa-calendar-alt' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text3)',
              boxShadow: activeTab === tab.id ? '0 10px 20px -10px var(--accent)' : 'none',
              transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)',
              cursor: 'pointer'
            }}
          >
            <i className={`fas ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analiz' ? (
        <div className="animate-fade-up">
          {/* Stats Grid - Compact */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Soru', val: totalSolved, icon: 'fa-check-double', color: 'var(--text)' },
              { label: 'Net', val: totalNet, icon: 'fa-chart-line', color: 'var(--accent)' },
              { label: 'Başarı', val: `%${globalAcc}`, icon: 'fa-percentage', color: '#10b981' },
              { label: 'Seri', val: `${state.streak} Gün`, icon: 'fa-fire', color: '#f59e0b' }
            ].map((s, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px' }}>
                <div style={{ width: '28px', height: '28px', flexShrink: 0, background: 'var(--card-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.55rem', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1px', whiteSpace: 'nowrap' }}>{s.label}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1, whiteSpace: 'nowrap' }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-mobile-col" style={{ gap: '24px' }}>
            {/* Subject Analysis */}
            <div style={{ flex: 1.6 }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px' }}>Ders ve Ünite Analizi</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
                        <div onClick={() => setOpenSubjects(p => ({ ...p, [s.id]: !p[s.id] }))} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', cursor: 'pointer', borderRadius: '10px' }} className="hover-bg">
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></div>
                          <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}>{s.name}</span>
                          <div style={{ width: '70px', height: '5px', background: 'var(--card-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: s.color }}></div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, width: '30px', textAlign: 'right' }}>%{pct}</span>
                        </div>
                        {isOpen && (
                          <div style={{ padding: '8px 10px 10px 30px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {s.units.map((u, i) => {
                              const ud = state.units[`${s.id}_${i}`] || { correct: 0, wrong: 0 };
                              return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '5px 0', borderBottom: '1px dashed var(--border)' }}>
                                  <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{u}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#3dd68c', fontWeight: 700 }}>{ud.correct}D</span>
                                    <span style={{ color: '#f43f5e', fontWeight: 700 }}>{ud.wrong}Y</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button className="btn btn-ghost" style={{ padding: '3px 6px', fontSize: '10px' }} onClick={() => { setCurrentAction({ sid: s.id, ui: i, subjectName: s.name, unitName: u }); setSolveData({ correct: 0, wrong: 0 }); setSolveModalOpen(true); }}>Soru</button>
                                      <button className="btn btn-ghost" style={{ padding: '3px 6px', fontSize: '10px' }} onClick={() => { setCurrentAction({ sid: s.id, ui: i, subjectName: s.name, unitName: u }); setStudyModalOpen(true); }}>Çalış</button>
                                    </div>
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

            {/* Goals */}
            <div style={{ flex: 1 }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Günlük Hedefler</h3>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '10px' }}>
                    {state.goals.filter((g: any) => g.done).length}/{state.goals.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {state.goals.map((g: any) => (
                    <div key={g.id} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      <div onClick={() => toggleGoal(g.id)} style={{ width: '18px', height: '18px', borderRadius: '5px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: g.done ? 'var(--accent)' : 'transparent', borderColor: g.done ? 'var(--accent)' : 'var(--border)' }}>
                        {g.done && <i className="fas fa-check" style={{ fontSize: '8px', color: 'white' }}></i>}
                      </div>
                      <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: g.done ? 'var(--text3)' : 'var(--text)', textDecoration: g.done ? 'line-through' : 'none' }}>{g.text}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setGoalModalOpen(true)}>+ Yeni Hedef Ekle</button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-history" style={{ color: 'var(--accent)' }}></i> Ders Çalışma Günlüğü
            </h3>
            <div style={{ position: 'relative', paddingLeft: '30px' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', background: 'var(--border)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mergedHistory.map((event: any) => {
                  const dateObj = new Date(event.date);
                  const label = `${dateObj.getHours() || '00'}:${dateObj.getMinutes().toString().padStart(2, '0')} - ${dateObj.toLocaleDateString('tr-TR')}`;
                  const isDb = !!event.id && typeof event.id === 'string'; // DB exams have string IDs

                  const configMap: Record<string, any> = {
                    solve: { icon: 'fa-check', bg: '#10b981', label: 'Soru Çözümü' },
                    study: { icon: 'fa-stopwatch', bg: '#6366f1', label: 'Konu Tanımı' },
                    exam: { icon: 'fa-file-signature', bg: '#f59e0b', label: 'Deneme Girişi' }
                  };
                  const config = configMap[event.type] || { icon: 'fa-info', bg: 'var(--accent)', label: 'Bilgi' };

                  return (
                    <div key={event.id} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: config.bg, border: '3px solid var(--bg)', zIndex: 2 }}></div>
                      <div className="hover-bg" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: config.bg, textTransform: 'uppercase' }}>{config.label} {isDb && '(DB)'}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
                        </div>
                        {event.type === 'solve' && (
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.subject} <span style={{ color: 'var(--text2)', fontWeight: 500 }}>- {event.unit}</span></p>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
                              <span style={{ color: '#3dd68c' }}>{event.correct} Doğru</span> • <span style={{ color: '#f43f5e' }}>{event.wrong} Yanlış</span>
                            </p>
                          </div>
                        )}
                        {event.type === 'study' && (
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.subject} <span style={{ color: 'var(--text2)', fontWeight: 500 }}>- {event.unit}</span></p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, marginTop: '4px' }}>{event.duration} dakika çalışıldı</p>
                          </div>
                        )}
                        {event.type === 'exam' && (
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.name}</p>
                            <p style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800, marginTop: '4px' }}>{event.net} Net</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-up">
           <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-calendar-alt" style={{ color: 'var(--accent)' }}></i> 15 Günlük Çalışma Ajandası
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {agendaDays.map(day => (
                    <div key={day.dateKey} style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        padding: '16px', 
                        borderRadius: '16px', 
                        background: day.isToday ? 'var(--accent-dim)' : 'var(--card-bg)', 
                        border: day.isToday ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
                        transition: 'all 0.2s ease'
                    }}>
                        <div style={{ width: '60px', textAlign: 'center', borderRight: '1px solid var(--border)', paddingRight: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: day.isToday ? 'var(--accent)' : 'var(--text3)', textTransform: 'uppercase' }}>{day.dayName.slice(0, 3)}</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 900, color: day.isToday ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{day.label.split(' ')[0]}</p>
                            <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text3)' }}>{day.label.split(' ')[1]}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="input"
                                placeholder={day.isToday ? "Bugün neler yapacaksın?" : "Planlarını buraya not et..."}
                                value={state.agenda[day.dateKey] || ""}
                                onChange={(e) => updateAgenda(day.dateKey, e.target.value)}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    minHeight: '40px', 
                                    padding: '4px 0', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 500,
                                    resize: 'none',
                                    color: 'var(--text)',
                                    width: '100%'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
           </div>
        </div>
      )}

      {/* Modals */}
      {isGoalModalOpen && (
        <div className="modal-overlay open" onClick={() => setGoalModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontWeight: 800 }}>Yeni Hedef</h3>
            <input type="text" className="input" value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Örn: 50 Matematik sorusu..." autoFocus />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setGoalModalOpen(false)}>İptal</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                const newState = { ...state };
                newState.goals.push({ id: Date.now(), text: newGoal.trim(), done: false });
                setState(newState);
                setNewGoal("");
                setGoalModalOpen(false);
              }}>Ekle</button>
            </div>
          </div>
        </div>
      )}

      {isSolveModalOpen && (
        <div className="modal-overlay open" onClick={() => setSolveModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>{currentAction?.subjectName}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentAction?.unitName}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div><label className="input-label">Doğru</label><input type="number" className="input" value={solveData.correct} onChange={e => setSolveData({ ...solveData, correct: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="input-label">Yanlış</label><input type="number" className="input" value={solveData.wrong} onChange={e => setSolveData({ ...solveData, wrong: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSolveModalOpen(false)}>İptal</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveSolve}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {isStudyModalOpen && (
        <div className="modal-overlay open" onClick={() => setStudyModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>Konu Çalışma</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentAction?.subjectName} - {currentAction?.unitName}</p>
            <div style={{ background: 'var(--accent-dim)', padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '10px' }}>{formatTime(timerSeconds)}</div>
              <button className={`btn ${isTimerRunning ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsTimerRunning(!isTimerRunning)}>
                {isTimerRunning ? 'Duraklat' : 'Başlat'}
              </button>
            </div>
            <input type="number" className="input" value={studyMinutes} onChange={e => setStudyMinutes(parseInt(e.target.value) || 0)} placeholder="Dakika..." />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setIsTimerRunning(false); setStudyModalOpen(false); }}>İptal</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveStudy}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-bg:hover { background: var(--accent-dim) !important; }
      `}</style>
    </div>
  );
}
