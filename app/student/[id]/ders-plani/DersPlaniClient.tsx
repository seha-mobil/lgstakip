'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  
  // Modals
  const [isSolveModalOpen, setSolveModalOpen] = useState(false);
  const [isStudyModalOpen, setStudyModalOpen] = useState(false);
  const [isAddGoalModalOpen, setAddGoalModalOpen] = useState(false);
  const [isSoruStatsModalOpen, setSoruStatsModalOpen] = useState(false);
  
  // Goal Modal State
  const [goalDateKey, setGoalDateKey] = useState("");
  const [goalType, setGoalType] = useState<"solve" | "study" | "custom">("solve");
  const [goalSubject, setGoalSubject] = useState(SUBJECT_DATA[0]);
  const [goalUnit, setGoalUnit] = useState(SUBJECT_DATA[0].units[0]);
  const [goalValue, setGoalValue] = useState("");
  const [goalCustomText, setGoalCustomText] = useState("");

  const [currentAction, setCurrentAction] = useState<any>(null);
  const [solveData, setSolveData] = useState({ correct: 0, wrong: 0 });
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  const [studyMinutes, setStudyMinutes] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const storageKey = `lgs_premium_v4_${studentId}`;
  const todayKey = new Date().toISOString().split('T')[0];

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem(`lgs_premium_v3_${studentId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.history) parsed.history = [];
      if (!parsed.agenda) parsed.agenda = {};
      
      // Data Migration
      Object.keys(parsed.agenda).forEach(key => {
        if (typeof parsed.agenda[key] === 'string') {
            const oldText = parsed.agenda[key];
            parsed.agenda[key] = oldText ? [{ id: Date.now() + Math.random(), type: 'custom', text: oldText, done: false }] : [];
        }
      });

      if (parsed.goals && parsed.goals.length > 0) {
        if (!parsed.agenda[todayKey]) parsed.agenda[todayKey] = [];
        parsed.agenda[todayKey] = [...parsed.agenda[todayKey], ...parsed.goals];
        delete parsed.goals;
      }
      setState(parsed);
    } else {
      setState({
        units: {},
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
  }, [storageKey, studentId, todayKey]);

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

  // Merge History
  const mergedHistory = useMemo(() => {
    if (!state) return [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const combined = [...state.history, ...dbExams];
    return combined
      .filter(event => new Date(event.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state, dbExams]);

  // Agenda Days
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

  // Critical Unit Detection Logic
  const criticalUnits = useMemo(() => {
    if (!state) return [];
    const critical: any[] = [];
    for (const sub of SUBJECT_DATA) {
        sub.units.forEach((unit, idx) => {
            const data = state.units[`${sub.id}_${idx}`];
            if (data) {
                const total = data.correct + data.wrong;
                const pct = total > 0 ? (data.correct / total) : 0;
                if (total >= 10 && pct < 0.8) {
                    critical.push({ sid: sub.id, ui: idx, subjectName: sub.name, unitName: unit, accuracy: Math.round(pct * 100), color: sub.color });
                }
            }
        });
    }
    return critical.sort((a, b) => a.accuracy - b.accuracy);
  }, [state]);

  // Weekly Goal Completion Logic
  const weeklyCompletion = useMemo(() => {
    if (!state || !state.agenda) return 0;
    let total = 0;
    let completed = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayGoals = state.agenda[key] || [];
        total += dayGoals.length;
        completed += dayGoals.filter((g: any) => g.done).length;
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [state]);

  // Helper to check if a unit is "Dusty" (>15 days no solve)
  const isUnitDusty = (sid: string, ui: number) => {
    if (!state) return false;
    const data = state.units[`${sid}_${ui}`];
    if (!data || !data.lastDate) return false;
    const diff = Date.now() - new Date(data.lastDate).getTime();
    return diff > 15 * 24 * 60 * 60 * 1000;
  };

  // Line Chart Data Processing
  const soruStatsData = useMemo(() => {
    if (!state) return null;
    const days: string[] = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const datasets = SUBJECT_DATA.map(sub => {
        const dataArr = days.map(day => {
            const daySolves = state.history.filter((h: any) => h.type === 'solve' && h.date.startsWith(day) && h.subject === sub.name);
            return daySolves.reduce((sum: number, s: any) => sum + (s.correct + s.wrong), 0);
        });
        
        return {
            label: sub.name,
            data: dataArr,
            borderColor: sub.color,
            backgroundColor: sub.color + '15',
            fill: true,
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2
        };
    });

    return {
        labels: days.map(d => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })),
        datasets
    };
  }, [state]);

  if (!state) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addHistory = (type: string, data: any) => {
    const newState = { ...state };
    newState.history.unshift({ id: Date.now(), type, date: new Date().toISOString(), ...data });
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
      newState.units[key].lastDate = new Date().toISOString(); // Update last solve date
      const today = new Date().toDateString();
      if (newState.lastSolveDate !== today) { newState.streak++; newState.lastSolveDate = today; }
      const dayIdx = [6, 0, 1, 2, 3, 4, 5][new Date().getDay()];
      newState.weekly.correct[dayIdx] += correct;
      newState.weekly.wrong[dayIdx] += wrong;
      setState(newState);
      addHistory('solve', { subject: currentAction.subjectName, unit: currentAction.unitName, correct, wrong });
    }
    setSolveModalOpen(false);
  };

  const toggleAgendaGoal = (dateKey: string, goalId: number) => {
    const newState = { ...state };
    if (!newState.agenda[dateKey]) return;
    newState.agenda[dateKey] = newState.agenda[dateKey].map((g: any) => 
        g.id === goalId ? { ...g, done: !g.done } : g
    );
    setState(newState);
  };

  const removeGoal = (dateKey: string, goalId: number) => {
    const newState = { ...state };
    newState.agenda[dateKey] = newState.agenda[dateKey].filter((g: any) => g.id !== goalId);
    setState(newState);
  };

  const addNewGoal = () => {
    const newState = { ...state };
    if (!newState.agenda[goalDateKey]) newState.agenda[goalDateKey] = [];
    let text = "";
    if (goalType === "solve") text = `${goalSubject.name} - ${goalUnit}: ${goalValue} Soru`;
    else if (goalType === "study") text = `${goalSubject.name} - ${goalUnit}: ${goalValue} Dakika Çalışma`;
    else text = goalCustomText;
    if (!text.trim()) return;
    newState.agenda[goalDateKey].push({ id: Date.now(), type: goalType, subject: goalSubject.name, unit: goalUnit, targetValue: goalValue, text, done: false });
    setState(newState);
    setAddGoalModalOpen(false);
    setGoalValue(""); setGoalCustomText("");
  };

  let totalCorrect = 0, totalWrong = 0;
  Object.values(state.units).forEach((u: any) => { totalCorrect += u.correct; totalWrong += u.wrong; });
  const totalSolved = totalCorrect + totalWrong;
  const totalNet = totalSolved ? (totalCorrect - (totalWrong / 3)).toFixed(2) : "0";
  const globalAcc = totalSolved ? Math.round((totalCorrect / totalSolved) * 100) : 0;
  const todayGoals = state.agenda[todayKey] || [];

  return (
    <>
      <div className="page animate-fade-up">
        {/* Header */}
        <div className="flex-mobile-col" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href={`/student/${studentId}`} className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}><i className="fas fa-arrow-left"></i></Link>
            <div><h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ders Planı: {studentName}</h1><p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 500 }}>Premium Gelişim Paneli</p></div>
          </div>
          <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}><i className="fas fa-clock"></i> {countdown.days} GÜN ({countdown.weeks} Hafta)</div>
        </div>

        {/* Tabs - Premium Segmented Control */}
        <div style={{ position: 'relative', display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', padding: '6px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.05)', width: 'fit-content', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ position: 'absolute', top: '6px', bottom: '6px', left: activeTab === 'analiz' ? '6px' : 'calc(50% + 2px)', width: 'calc(50% - 8px)', background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)', borderRadius: '14px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 15px -2px var(--accent-glow)', zIndex: 0 }} />
          {[{ id: 'analiz', label: 'Analiz & Durum', icon: 'fa-chart-pie' }, { id: 'planlama', label: 'Ajanda & Planlama', icon: 'fa-calendar-alt' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ position: 'relative', zIndex: 1, padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease', background: 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text3)', border: 'none', cursor: 'pointer', minWidth: '180px', justifyContent: 'center' }}>
              <i className={`fas ${tab.icon}`} style={{ fontSize: '1rem', opacity: activeTab === tab.id ? 1 : 0.6, transform: activeTab === tab.id ? 'none' : 'none', transition: 'all 0.3s ease' }}></i> <span style={{ letterSpacing: '0.3px', textShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none' }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'analiz' ? (
          <div key="analiz" className="animate-fade" style={{ contain: 'paint', isolation: 'isolate', transform: 'translateZ(0)' }}>
            <div className="flex-mobile-col" style={{ gap: '24px' }}>
              <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Compact Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[{ id: 'soru', label: 'Soru', val: totalSolved, icon: 'fa-check-double', color: 'var(--text)' }, { id: 'net', label: 'Net', val: totalNet, icon: 'fa-chart-line', color: 'var(--accent)' }, { id: 'basari', label: 'Başarı', val: `%${globalAcc}`, icon: 'fa-percentage', color: '#10b981' }, { id: 'hedef', label: 'Hedef', val: `%${weeklyCompletion}`, icon: 'fa-bullseye', color: '#f59e0b' }].map((s, idx) => (
                    <div 
                      key={idx} 
                      className="glass-card-solid" 
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', cursor: s.id === 'soru' ? 'pointer' : 'default' }}
                      onClick={() => s.id === 'soru' && setSoruStatsModalOpen(true)}
                    >
                      <div style={{ width: '22px', height: '22px', flexShrink: 0, background: 'var(--card-bg)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, border: '1px solid var(--border)', fontSize: '0.65rem' }}><i className={`fas ${s.icon}`}></i></div>
                      <div style={{ overflow: 'hidden' }}><p style={{ fontSize: '0.45rem', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0px', whiteSpace: 'nowrap' }}>{s.label}</p><p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1, whiteSpace: 'nowrap' }}>{s.val}</p></div>
                    </div>
                  ))}
                </div>
                {/* Subject Analysis (Including Dusty Icons) */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px' }}>Ders ve Ünite Analizi</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {SUBJECT_DATA.map(s => {
                      let sc = 0, sw = 0;
                      s.units.forEach((_, i) => { const u = state.units[`${s.id}_${i}`] || { correct: 0, wrong: 0 }; sc += u.correct; sw += u.wrong; });
                      const pct = (sc + sw) ? Math.round((sc / (sc + sw)) * 100) : 0;
                      const isOpen = openSubjects[s.id];
                      return (
                        <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
                          <div onClick={() => setOpenSubjects(p => ({ ...p, [s.id]: !p[s.id] }))} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', cursor: 'pointer', borderRadius: '10px' }} className="hover-bg">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></div>
                            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}>{s.name}</span>
                            <div style={{ width: '70px', height: '5px', background: 'var(--card-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}><div style={{ height: '100%', width: `${pct}%`, background: s.color }}></div></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, width: '30px', textAlign: 'right' }}>%{pct}</span>
                          </div>
                          {isOpen && (
                            <div style={{ padding: '8px 10px 10px 30px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {s.units.map((u, i) => { 
                                    const ud = state.units[`${s.id}_${i}`] || { correct: 0, wrong: 0, lastDate: null }; 
                                    const isDusty = isUnitDusty(s.id, i);
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '5px 0', borderBottom: '1px dashed var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{u}</span>
                                                {isDusty && (
                                                    <span title="Tozlanmış: 15+ gündür çalışılmadı!" style={{ color: '#f59e0b', fontSize: '0.75rem' }}>
                                                        <i className="fas fa-wind animate-pulse"></i>
                                                    </span>
                                                )}
                                            </div>
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

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Critical Radar */}
                <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', isolation: 'isolate' }}><i className="fas fa-satellite-dish"></i></div>
                    <div><h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Kritik Ünite Radarı</h3><p style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 600 }}>BAŞARI ORANI %80 ALTI ÜNİTELER</p></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {criticalUnits.length > 0 ? criticalUnits.slice(0, 4).map((cu, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}><p style={{ fontSize: '0.75rem', fontWeight: 800, color: cu.color }}>{cu.subjectName}</p><p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cu.unitName}</p></div>
                        <div style={{ textAlign: 'right' }}><p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f43f5e' }}>%{cu.accuracy}</p><button onClick={() => { setCurrentAction({ sid: cu.sid, ui: cu.ui, subjectName: cu.subjectName, unitName: cu.unitName }); setStudyModalOpen(true); }} style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', cursor: 'pointer', padding: '2px 0' }} className="hover-bg-btn">Tekrar Et</button></div>
                      </div>
                    )) : (<div style={{ textAlign: 'center', padding: '20px' }}><i className="fas fa-medal" style={{ fontSize: '1.5rem', color: '#f59e0b', marginBottom: '8px' }}></i><p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>Harika gidiyorsun! Şu an kritik bir konun bulunmuyor.</p></div>)}
                  </div>
                </div>

                {/* Daily Goals */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Bugünkü Hedefler</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '10px' }}>{todayGoals.filter((g: any) => g.done).length}/{todayGoals.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {todayGoals.length > 0 ? todayGoals.map((g: any) => (<div key={g.id} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}><div onClick={() => toggleAgendaGoal(todayKey, g.id)} style={{ width: '18px', height: '18px', borderRadius: '5px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: g.done ? 'var(--accent)' : 'transparent', borderColor: g.done ? 'var(--accent)' : 'var(--border)' }}>{g.done && <i className="fas fa-check" style={{ fontSize: '8px', color: 'white' }}></i>}</div><span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: g.done ? 'var(--text3)' : 'var(--text)', textDecoration: g.done ? 'line-through' : 'none' }}>{g.text}</span></div>)) : <p style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center', padding: '20px' }}>Henüz bir hedef planlanmamış.</p>}
                  </div>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => { setGoalDateKey(todayKey); setAddGoalModalOpen(true); }}>+ Yeni Hedef Ekle</button>
                </div>
              </div>
            </div>

            {/* Timeline Journal */}
            <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-history" style={{ color: 'var(--accent)' }}></i> Ders Çalışma Günlüğü</h3>
              <div style={{ position: 'relative', paddingLeft: '30px' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>{mergedHistory.map((event: any) => { const dateObj = new Date(event.date); const label = `${dateObj.getHours() || '00'}:${dateObj.getMinutes().toString().padStart(2, '0')} - ${dateObj.toLocaleDateString('tr-TR')}`; const isDb = typeof event.id === 'string'; const configMap: any = { solve: { icon: 'fa-check', bg: '#10b981', label: 'Soru Çözümü' }, study: { icon: 'fa-stopwatch', bg: '#6366f1', label: 'Konu Tanımı' }, exam: { icon: 'fa-file-signature', bg: '#f59e0b', label: 'Deneme Girişi' } }; const config = configMap[event.type] || { icon: 'fa-info', bg: 'var(--accent)', label: 'Bilgi' }; return (<div key={event.id} style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: config.bg, border: '3px solid var(--bg)', zIndex: 2 }}></div><div className="hover-bg" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><span style={{ fontSize: '0.65rem', fontWeight: 800, color: config.bg, textTransform: 'uppercase' }}>{config.label} {isDb && '(DB)'}</span><span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 600 }}>{label}</span></div>{event.type === 'solve' && <div><p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.subject} <span style={{ color: 'var(--text2)', fontWeight: 500 }}>- {event.unit}</span></p><p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}><span style={{ color: '#3dd68c' }}>{event.correct} Doğru</span> • <span style={{ color: '#f43f5e' }}>{event.wrong} Yanlış</span></p></div>}{event.type === 'study' && <div><p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.subject} <span style={{ color: 'var(--text2)', fontWeight: 500 }}>- {event.unit}</span></p><p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, marginTop: '4px' }}>{event.duration} dakika çalışıldı</p></div>}{event.type === 'exam' && <div><p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.name}</p><p style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800, marginTop: '4px' }}>{event.net} Net</p></div>}</div></div>); })}</div>
              </div>
            </div>
          </div>
        ) : (
          <div key="planlama" className="animate-fade" style={{ contain: 'paint', isolation: 'isolate', transform: 'translateZ(0)' }}>
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-calendar-alt" style={{ color: 'var(--accent)' }}></i> 15 Günlük Çalışma Ajandası</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {agendaDays.map(day => (
                  <div key={day.dateKey} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '16px', background: day.isToday ? 'var(--accent-dim)' : 'var(--card-bg)', border: day.isToday ? '1px solid var(--accent-glow)' : '1px solid var(--border)' }}>
                    <div style={{ width: '60px', textAlign: 'center', borderRight: '1px solid var(--border)', paddingRight: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: day.isToday ? 'var(--accent)' : 'var(--text3)', textTransform: 'uppercase' }}>{day.dayName.slice(0, 3)}</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 900, color: day.isToday ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{day.label.split(' ')[0]}</p>
                      <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text3)' }}>{day.label.split(' ')[1]}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(state.agenda[day.dateKey] || []).map((goal: any) => (<div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}><div onClick={() => toggleAgendaGoal(day.dateKey, goal.id)} style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: goal.done ? 'var(--accent)' : 'transparent', borderColor: goal.done ? 'var(--accent)' : 'var(--border)' }}>{goal.done && <i className="fas fa-check" style={{ fontSize: '8px', color: 'white' }}></i>}</div><span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: goal.done ? 'var(--text3)' : 'var(--text)', textDecoration: goal.done ? 'line-through' : 'none' }}>{goal.text}</span><button onClick={() => removeGoal(day.dateKey, goal.id)} style={{ color: 'var(--text3)', fontSize: '0.8rem', opacity: 0.5 }} className="hover-bg-btn"><i className="fas fa-times"></i></button></div>))}
                        <button onClick={() => { setGoalDateKey(day.dateKey); setAddGoalModalOpen(true); }} style={{ padding: '8px', borderRadius: '10px', border: '1px dashed var(--border)', fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }} className="hover-bg">+ Hedef Ekle</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals outside with absolute viewport-fixed positioning */}
      {isAddGoalModalOpen && (
        <div className="modal-overlay open" onClick={() => setAddGoalModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '440px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Yeni Hedef Planla</h3><p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{agendaDays.find(d => d.dateKey === goalDateKey)?.label} için hedef ekliyorsun</p></div>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg)', padding: '4px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                {[{ id: 'solve', label: 'Soru', icon: 'fa-check' }, { id: 'study', label: 'Çalışma', icon: 'fa-stopwatch' }, { id: 'custom', label: 'Özel', icon: 'fa-pen' }].map(t => (<button key={t.id} onClick={() => setGoalType(t.id as any)} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, background: goalType === t.id ? 'var(--accent)' : 'transparent', color: goalType === t.id ? 'white' : 'var(--text3)', border: 'none', cursor: 'pointer' }}><i className={`fas ${t.icon}`}></i> {t.label}</button>))}
            </div>
            {goalType !== 'custom' ? (<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><div><label className="input-label">Branş / Ders</label><select className="input" value={goalSubject.id} onChange={(e) => { const sub = SUBJECT_DATA.find(s => s.id === e.target.value); if (sub) { setGoalSubject(sub); setGoalUnit(sub.units[0]); } }}>{SUBJECT_DATA.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="input-label">Ünite</label><select className="input" value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)}>{goalSubject.units.map((u, i) => <option key={i} value={u}>{u}</option>)}</select></div><div><label className="input-label">{goalType === 'solve' ? 'Hedef Soru Sayısı' : 'Hedef Süre (Dakika)'}</label><input type="number" className="input" placeholder={goalType === 'solve' ? "Örn: 50" : "Örn: 40"} value={goalValue} onChange={(e) => setGoalValue(e.target.value)} /></div></div>) : (<div><label className="input-label">Özel Hedef Notu</label><textarea className="input" style={{ minHeight: '80px', resize: 'none' }} placeholder="Örn: Bugün genel deneme çözülecek..." value={goalCustomText} onChange={(e) => setGoalCustomText(e.target.value)}></textarea></div>)}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}><button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAddGoalModalOpen(false)}>Vazgeç</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addNewGoal}>Hedefi Ekle</button></div>
          </div>
        </div>
      )}

      {isSolveModalOpen && (
        <div className="modal-overlay open" onClick={() => setSolveModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>{currentAction?.subjectName}</h3><p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentAction?.unitName}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}><div><label className="input-label">Doğru</label><input type="number" className="input" value={solveData.correct} onChange={e => setSolveData({ ...solveData, correct: parseInt(e.target.value) || 0 })} /></div><div><label className="input-label">Yanlış</label><input type="number" className="input" value={solveData.wrong} onChange={e => setSolveData({ ...solveData, wrong: parseInt(e.target.value) || 0 })} /></div></div>
            <div style={{ display: 'flex', gap: '12px' }}><button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSolveModalOpen(false)}>İptal</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveSolve}>Kaydet</button></div>
          </div>
        </div>
      )}

      {isStudyModalOpen && (
        <div className="modal-overlay open" onClick={() => setStudyModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>Konu Çalışma</h3><p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentAction?.subjectName} - {currentAction?.unitName}</p>
            <div style={{ background: 'var(--accent-dim)', padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}><div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '10px' }}>{formatTime(timerSeconds)}</div><button className={`btn ${isTimerRunning ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsTimerRunning(!isTimerRunning)}>{isTimerRunning ? 'Duraklat' : 'Başlat'}</button></div>
            <input type="number" className="input" value={studyMinutes} onChange={e => setStudyMinutes(parseInt(e.target.value) || 0)} placeholder="Dakika..." />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setIsTimerRunning(false); setStudyModalOpen(false); }}>İptal</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { addHistory('study', { subject: currentAction.subjectName, unit: currentAction.unitName, duration: studyMinutes }); setStudyMinutes(0); setTimerSeconds(0); setIsTimerRunning(false); setStudyModalOpen(false); }}>Kaydet</button></div>
          </div>
        </div>
      )}

      {isSoruStatsModalOpen && (
        <div className="modal-overlay open" onClick={() => setSoruStatsModalOpen(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Soru Çözüm Analizi</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 600 }}>Son 15 Günlük Performans Grafiği</p>
                </div>
                <button onClick={() => setSoruStatsModalOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                {soruStatsData && (
                    <div style={{ height: '300px', width: '100%' }}>
                        <Line 
                            data={soruStatsData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' }, usePointStyle: true, padding: 20 } },
                                    tooltip: { backgroundColor: '#0f172a', titleFont: { size: 12 }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 10, displayColors: true }
                                },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
                                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                                }
                            }} 
                        />
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {SUBJECT_DATA.map(sub => {
                    const total = state.history.filter((h: any) => h.type === 'solve' && h.subject === sub.name).reduce((sum: number, s: any) => sum + (s.correct + s.wrong), 0);
                    return (
                        <div key={sub.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: `4px solid ${sub.color}` }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase' }}>{sub.name}</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>{total} <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>Soru</span></p>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hover-bg:hover { background: var(--accent-dim) !important; }
        .hover-bg-btn:hover { opacity: 1 !important; color: #f43f5e !important; background: transparent; }
        .modal-overlay { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(0, 0, 0, 0.6) !important; backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 9999 !important; padding: 20px !important; opacity: 0; pointer-events: none; transition: all 0.3s ease; }
        .modal-overlay.open { opacity: 1 !important; pointer-events: auto !important; }
        .modal-overlay .glass-card { transform: scale(0.9); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .modal-overlay.open .glass-card { transform: scale(1) !important; }
        
        .animate-fade { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
