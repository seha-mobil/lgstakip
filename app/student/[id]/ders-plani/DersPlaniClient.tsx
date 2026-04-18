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
  { 
    id: "mat", 
    name: "Matematik", 
    icon: "fa-calculator", 
    color: "#6366f1", 
    units: [
      { name: "1. ÜNİTE: Sayılar ve İşlemler", topics: ["Çarpanlar ve Katlar", "Üslü İfadeler"] },
      { name: "2. ÜNİTE: Veri İşleme ve Karekök", topics: ["Kareköklü İfadeler", "Veri Analizi"] },
      { name: "3. ÜNİTE: Olasılık ve Cebir", topics: ["Basit Olayların Olasılığı", "Cebirsel İfadeler ve Özdeşlikler"] },
      { name: "4. ÜNİTE: Denklemler ve Eşitsizlikler", topics: ["Doğrusal Denklemler (Eğim dahil)", "Eşitsizlikler"] },
      { name: "5. ÜNİTE: Geometri (Üçgenler)", topics: ["Üçgenler (Pisagor dahil)", "Eşlik ve Benzerlik"] },
      { name: "6. ÜNİTE: Uzay Geometri", topics: ["Dönüşüm Geometrisi", "Geometrik Cisimler (Hacim ve Alan)"] }
    ]
  },
  { 
    id: "tur", 
    name: "Türkçe", 
    icon: "fa-book", 
    color: "#10b981", 
    units: [
      { name: "1. ÜNİTE: Okuma (Anlam Bilgisi)", topics: ["Sözcükte Anlam", "Cümlede Anlam", "Parçada Anlam"] },
      { name: "2. ÜNİTE: Dil Bilgisi", topics: ["Fiilimsiler", "Cümlenin Öğeleri", "Fiilde Çatı", "Cümle Türleri"] },
      { name: "3. ÜNİTE: Yazma ve Yazım Kuralları", topics: ["Yazım Kuralları", "Noktalama İşaretleri", "Metin Türleri", "Söz Sanatları"] }
    ]
  },
  { 
    id: "fen", 
    name: "Fen Bilimleri", 
    icon: "fa-flask", 
    color: "#f59e0b", 
    units: [
      { name: "1. ÜNİTE: Mevsimler ve İklim", topics: ["Mevsimlerin Oluşumu", "İklim ve Hava Hareketleri"] },
      { name: "2. ÜNİTE: DNA ve Genetik Kod", topics: ["DNA ve Genetik Kod", "Kalıtım", "Mutasyon ve Modifikasyon", "Adaptasyon", "Biyoteknoloji"] },
      { name: "3. ÜNİTE: Basınç", topics: ["Katı Basıncı", "Sıvı Basıncı", "Gaz Basıncı"] },
      { name: "4. ÜNİTE: Madde ve Endüstri", topics: ["Periyodik Sistem", "Fiziksel ve Kimyasal Değişimler", "Kimyasal Tepkimeler", "Asitler ve Bazlar"] },
      { name: "5. ÜNİTE: Basit Makineler", topics: ["Makaralar", "Kaldıraçlar", "Eğik Düzlem", "Dişli Çarklar"] }
    ]
  },
  { 
    id: "ing", 
    name: "İngilizce", 
    icon: "fa-language", 
    color: "#3b82f6", 
    units: [
      { name: "1. ÜNİTE: Friendship & Teen Life", topics: ["Friendship", "Teen Life"] },
      { name: "2. ÜNİTE: Daily Life & Kitchen", topics: ["In The Kitchen", "On The Phone"] },
      { name: "3. ÜNİTE: Modern World", topics: ["The Internet", "Adventures", "Tourism"] }
    ]
  },
  { 
    id: "ink", 
    name: "İnkılap Tarihi", 
    icon: "fa-history", 
    color: "#ef4444", 
    units: [
      { name: "1. ÜNİTE: Bir Kahraman Doğuyor", topics: ["Uyanan Avrupa ve Sarsılan Osmanlı", "Mustafa Kemal'in Askerlik Hayatı"] },
      { name: "2. ÜNİTE: Milli Uyanış", topics: ["Birinci Dünya Savaşı", "Milli Cemiyetler", "Erzurum ve Sivas Kongreleri"] },
      { name: "3. ÜNİTE: Milli Bir Destan", topics: ["Doğu ve Güney Cepheleri", "Sakarya ve Büyük Taarruz"] }
    ]
  },
  { 
    id: "din", 
    name: "Din Kültürü", 
    icon: "fa-star-and-crescent", 
    color: "#8b5cf6", 
    units: [
      { name: "1. ÜNİTE: Kader İnancı", topics: ["Kader ve Kaza İnancı", "İnsanın İradesi ve Kader", "Zekat ve Sadaka"] },
      { name: "2. ÜNİTE: Din ve Hayat", topics: ["Din ve Hayat", "Hz. Muhammed'in Örnekliği"] }
    ]
  }
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
  const storageKey = `lgs_premium_v5_${studentId}`;

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editUnitData, setEditUnitData] = useState({ correct: 0, wrong: 0, sid: '', ui: 0, ti: 0, topicName: '', unitName: '', subjectName: '' });
  
  // Goal Modal State
  const [goalDateKey, setGoalDateKey] = useState("");
  const [goalType, setGoalType] = useState<"solve" | "study" | "custom">("solve");
  const [goalSubject, setGoalSubject] = useState(SUBJECT_DATA[0]);
  const [goalUnit, setGoalUnit] = useState(SUBJECT_DATA[0].units[0]);
  const [goalTopic, setGoalTopic] = useState(SUBJECT_DATA[0].units[0].topics[0]);
  const [goalValue, setGoalValue] = useState("");
  const [goalCustomText, setGoalCustomText] = useState("");
  const [isAnalysisEditMode, setIsAnalysisEditMode] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
    
  // Safer date key formatter (Local YYYY-MM-DD instead of UTC to fix shifting)
  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = formatDateKey(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayKey);
  const [isDayDetailModalOpen, setDayDetailModalOpen] = useState(false);

  const [currentAction, setCurrentAction] = useState<any>(null);
  const [solveData, setSolveData] = useState({ correct: 0, wrong: 0 });
  const [selectedDateTime, setSelectedDateTime] = useState("");

  const initDateTime = () => {
    const now = new Date();
    // Format YYYY-MM-DDTHH:mm for datetime-local input
    const localISO = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setSelectedDateTime(localISO);
  };

  const changeDateTimeDay = (days: number) => {
    if (!selectedDateTime) return;
    const current = new Date(selectedDateTime);
    current.setDate(current.getDate() + days);
    const localISO = new Date(current.getTime() - (current.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setSelectedDateTime(localISO);
  };

  const updateTime = (h: string, m: string) => {
    if (!selectedDateTime) return;
    const [datePart] = selectedDateTime.split('T');
    
    // Parse as integers to handle typing naturally, then pad for ISO format
    let hNum = parseInt(h);
    let mNum = parseInt(m);
    
    // Handle empty input or NaN while typing
    if (isNaN(hNum)) hNum = 0;
    if (isNaN(mNum)) mNum = 0;

    const hour = Math.min(23, Math.max(0, hNum)).toString().padStart(2, '0');
    const min = Math.min(59, Math.max(0, mNum)).toString().padStart(2, '0');
    setSelectedDateTime(`${datePart}T${hour}:${min}`);
  };

  const getHHMM = () => {
    if (!selectedDateTime) return { h: "12", m: "00" };
    const [, timePart] = selectedDateTime.split('T');
    const [h, m] = timePart.split(':');
    // Return numeric strings without leading zeros for natural typing
    return { 
        h: parseInt(h || "0").toString(), 
        m: parseInt(m || "0").toString() 
    };
  };
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const [studyMinutes, setStudyMinutes] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);


  // Load state and perform Data Migration
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem(`lgs_premium_v4_${studentId}`) || localStorage.getItem(`lgs_premium_v3_${studentId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.history) parsed.history = [];
      if (!parsed.agenda) parsed.agenda = {};
      
      // Data Migration V4 -> V5 (Flat -> Hierarchical)
      if (!parsed.version || parsed.version < 5) {
          const oldUnits = parsed.units || {};
          const newUnits: any = {};
          
          SUBJECT_DATA.forEach(sub => {
              let topicIndex = 0;
              sub.units.forEach((unit, ui) => {
                  unit.topics.forEach((topic, ti) => {
                      const oldKey = `${sub.id}_${topicIndex}`;
                      if (oldUnits[oldKey]) {
                          newUnits[`${sub.id}_u${ui}_t${ti}`] = oldUnits[oldKey];
                      }
                      topicIndex++;
                  });
              });
          });
          parsed.units = newUnits;
          parsed.version = 5;
      }

      // Cleanup goals migration
      if (parsed.goals && parsed.goals.length > 0) {
        if (!parsed.agenda[todayKey]) parsed.agenda[todayKey] = [];
        parsed.agenda[todayKey] = [...parsed.agenda[todayKey], ...parsed.goals];
        delete parsed.goals;
      }
      setState(parsed);
    } else {
      setState({
        version: 5,
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
        sub.units.forEach((unit, ui) => {
            unit.topics.forEach((topic, ti) => {
                const data = state.units[`${sub.id}_u${ui}_t${ti}`];
                if (data) {
                    const total = data.correct + data.wrong;
                    const pct = total > 0 ? (data.correct / total) : 0;
                    if (total >= 10 && pct < 0.8) {
                        critical.push({ sid: sub.id, ui, ti, subjectName: sub.name, unitName: unit.name, topicName: topic, accuracy: Math.round(pct * 100), color: sub.color });
                    }
                }
            });
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
  const isUnitDusty = (sid: string, ui: number, ti: number) => {
    if (!state) return false;
    const data = state.units[`${sid}_u${ui}_t${ti}`];
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
            borderWidth: 2,
            borderDash: [] as number[]
        };
    });

    // Add Total Line
    const totalDataArr = days.map((_, dayIdx) => {
        return datasets.reduce((sum, ds) => sum + ds.data[dayIdx], 0);
    });

    datasets.unshift({
        label: 'TOPLAM',
        data: totalDataArr,
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255,255,255,0.05)',
        fill: true,
        tension: 0.4,
        cubicInterpolationMode: 'monotone' as const,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 3,
        borderDash: [5, 5]
    });

    return {
        labels: days.map(d => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })),
        datasets
    };
  }, [state]);

  const updateUnitStats = () => {
    if (!state) return;
    const { sid, ui, ti, correct, wrong } = editUnitData;
    const key = `${sid}_u${ui}_t${ti}`;
    const newState = { ...state };
    newState.units[key] = { 
        ...(newState.units[key] || { lastDate: null }),
        correct, 
        wrong,
        lastDate: new Date().toISOString()
    };
    setState(newState);
    setEditModalOpen(false);
  };

  const resetUnitStats = () => {
    if (!window.confirm("Bu ünitenin TÜM verilerini ve geçmiş kayıtlarını sıfırlamak istediğine emin misin? Bu işlem grafikleri de temizleyecektir.")) return;
    if (!state) return;
    const { sid, ui, ti, subjectName, topicName } = editUnitData;
    const key = `${sid}_u${ui}_t${ti}`;
    const newState = { ...state };
    
    // 1. Remove from unit totals
    delete newState.units[key];
    
    // 2. Remove matching records from history to clear charts
    newState.history = newState.history.filter((h: any) => {
        const hSub = (h.subject || "").trim().toLowerCase();
        const targetSub = (subjectName || "").trim().toLowerCase();
        
        // Subject mismatch
        if (hSub !== targetSub) return true;

        // If it's legacy data (missing unit/topic), the user approved clearing it
        if (!h.unit || !h.topic) return false;

        // Check if it matches the current topic/unit being reset
        const hTopic = (h.topic || "").trim().toLowerCase();
        const targetTopic = (topicName || "").trim().toLowerCase();
        const hUnit = (h.unit || "").trim().toLowerCase();
        const targetUnit = (editUnitData.unitName || "").trim().toLowerCase();
        
        const isMatch = hTopic === targetTopic || hUnit === targetUnit;
        
        // 3. If it's a solve and it matches, subtract from weekly stats
        if (isMatch && h.type === 'solve') {
            const logDate = new Date(h.date);
            const dayIdx = [6, 0, 1, 2, 3, 4, 5][logDate.getDay()];
            newState.weekly.correct[dayIdx] = Math.max(0, (newState.weekly.correct[dayIdx] || 0) - (h.correct || 0));
            newState.weekly.wrong[dayIdx] = Math.max(0, (newState.weekly.wrong[dayIdx] || 0) - (h.wrong || 0));
        }
        return !isMatch;
    });

    setState(newState);
    setEditModalOpen(false);
  };
  const removeHistoryItem = (id: number) => {
    if (!window.confirm("Bu kaydı silmek istediğine emin misin? Bu işlem bağlı tüm istatistikleri de düzeltecektir.")) return;
    const newState = { ...state };
    const itemIdx = newState.history.findIndex((h: any) => h.id === id);
    if (itemIdx === -1) return;

    const item = newState.history[itemIdx];

    if (item.type === 'solve') {
        const logDate = new Date(item.date);
        const dayIdx = [6, 0, 1, 2, 3, 4, 5][logDate.getDay()];
        newState.weekly.correct[dayIdx] = Math.max(0, (newState.weekly.correct[dayIdx] || 0) - (item.correct || 0));
        newState.weekly.wrong[dayIdx] = Math.max(0, (newState.weekly.wrong[dayIdx] || 0) - (item.wrong || 0));

        // 2. Roll back unit totals
        // We need to find the branch id. Use case-insensitive match for robustness.
        const branch = SUBJECT_DATA.find(s => s.name.trim().toLowerCase() === item.subject.trim().toLowerCase());
        if (branch) {
            let ui = -1, ti = -1;
            branch.units.forEach((u, uIdx) => {
                const tIdx = u.topics.indexOf(item.topic);
                if (tIdx !== -1) { ui = uIdx; ti = tIdx; }
            });
            if (ui !== -1 && ti !== -1) {
                const key = `${branch.id}_u${ui}_t${ti}`;
                if (newState.units[key]) {
                    newState.units[key].correct = Math.max(0, newState.units[key].correct - (item.correct || 0));
                    newState.units[key].wrong = Math.max(0, newState.units[key].wrong - (item.wrong || 0));
                }
            }
        }
    }
    newState.history.splice(itemIdx, 1);
    setState(newState);
  };


  if (!state) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addHistory = (type: string, data: any, dateOverride?: string) => {
    const newState = { ...state };
    const date = dateOverride || new Date().toISOString();
    newState.history.unshift({ id: Date.now(), type, date, ...data });
    // Sort history by date descending
    newState.history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (newState.history.length > 100) newState.history = newState.history.slice(0, 100);
    setState(newState);
  };

  const saveSolve = () => {
    const { correct, wrong } = solveData;
    if (correct + wrong > 0) {
      const newState = { ...state };
      const key = `${currentAction.sid}_u${currentAction.ui}_t${currentAction.ti}`;
      const logDate = selectedDateTime ? new Date(selectedDateTime) : new Date();
      const isoDate = logDate.toISOString();

      if (!newState.units[key]) newState.units[key] = { correct: 0, wrong: 0 };
      newState.units[key].correct += correct;
      newState.units[key].wrong += wrong;
      
      // Update lastDate only if this solve is newer
      if (!newState.units[key].lastDate || new Date(isoDate) > new Date(newState.units[key].lastDate)) {
        newState.units[key].lastDate = isoDate;
      }

      const dateStr = logDate.toDateString();
      if (newState.lastSolveDate !== dateStr) { 
        newState.streak++; 
        newState.lastSolveDate = dateStr; 
      }
      
      const dayIdx = [6, 0, 1, 2, 3, 4, 5][logDate.getDay()];
      newState.weekly.correct[dayIdx] += correct;
      newState.weekly.wrong[dayIdx] += wrong;
      
      setState(newState);
      addHistory('solve', { subject: currentAction.subjectName, unit: currentAction.unitName, topic: currentAction.topicName, correct, wrong }, isoDate);
    }
    setSolveData({ correct: 0, wrong: 0 });
    setSelectedDateTime("");
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
    const logDate = selectedDateTime ? new Date(selectedDateTime) : new Date();
    const finalDateKey = selectedDateTime ? logDate.toISOString().split('T')[0] : goalDateKey;
    const timeStr = logDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (!newState.agenda[finalDateKey]) newState.agenda[finalDateKey] = [];
    let text = "";
    if (goalType === "solve") text = `${goalSubject.name} - ${goalTopic} (${goalValue} Soru) [${timeStr}]`;
    else if (goalType === "study") text = `${goalSubject.name} - ${goalTopic} (${goalValue} Dakika) [${timeStr}]`;
    else text = `${goalCustomText} [${timeStr}]`;
    
    if (!text.trim()) return;
    newState.agenda[finalDateKey].push({ id: Date.now(), type: goalType, subject: goalSubject.name, unit: goalUnit.name, topic: goalTopic, targetValue: goalValue, text, done: false, time: timeStr });
    setState(newState);
    setAddGoalModalOpen(false);
    setGoalValue(""); setGoalCustomText(""); setSelectedDateTime("");
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
        <div style={{ position: 'relative', display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(13, 18, 32, 0.98)', padding: '6px', borderRadius: '18px', border: '1px solid var(--border)', width: 'fit-content', boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.5)', marginLeft: 'auto', marginRight: 'auto', isolation: 'isolate', contain: 'content' }}>
          <div style={{ 
            position: 'absolute', 
            top: '6px', 
            bottom: '6px', 
            left: '6px', 
            width: 'calc(50% - 8px)', 
            background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)', 
            borderRadius: '14px', 
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            transform: activeTab === 'analiz' ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
            boxShadow: '0 2px 10px rgba(232, 184, 75, 0.3)', 
            zIndex: 0 
          }} />
          {[{ id: 'analiz', label: 'Analiz & Durum', icon: 'fa-chart-pie' }, { id: 'planlama', label: 'Ajanda & Planlama', icon: 'fa-calendar-alt' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ position: 'relative', zIndex: 1, padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease', background: 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text3)', border: 'none', cursor: 'pointer', minWidth: '180px', justifyContent: 'center' }}>
              <i className={`fas ${tab.icon}`} style={{ fontSize: '1rem', opacity: activeTab === tab.id ? 1 : 0.6, transform: activeTab === tab.id ? 'none' : 'none', transition: 'all 0.3s ease' }}></i> <span style={{ letterSpacing: '0.3px', textShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none' }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'analiz' ? (
          <div key="analiz" className="animate-fade" style={{ contain: 'content', isolation: 'isolate' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Ders, Ünite ve Konu Analizi</h3>
                  <button 
                    onClick={() => setIsAnalysisEditMode(!isAnalysisEditMode)} 
                    style={{ 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        background: isAnalysisEditMode ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                        color: isAnalysisEditMode ? 'white' : 'var(--text3)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem'
                    }}
                    className="hover-bg-btn"
                    title={isAnalysisEditMode ? "Düzenlemeyi Kapat" : "Düzenlemeyi Aç"}
                  >
                    <i className={`fas fa-${isAnalysisEditMode ? 'times' : 'pen'}`}></i>
                  </button>
                </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SUBJECT_DATA.map(s => {
                      let totalC = 0, totalW = 0;
                      s.units.forEach((unit, ui) => {
                          unit.topics.forEach((topic, ti) => {
                              const data = state.units[`${s.id}_u${ui}_t${ti}`] || { correct: 0, wrong: 0 };
                              totalC += data.correct; totalW += data.wrong;
                          });
                      });
                      const branchPct = (totalC + totalW) ? Math.round((totalC / (totalC + totalW)) * 100) : 0;
                      const isBranchOpen = openSubjects[s.id];

                      return (
                        <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                          <div onClick={() => setOpenSubjects(p => ({ ...p, [s.id]: !p[s.id] }))} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderRadius: '12px', background: isBranchOpen ? 'var(--accent-dim)' : 'transparent' }} className="hover-bg">
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, boxShadow: `0 0 10px ${s.color}60` }}></div>
                            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 800 }}>{s.name}</span>
                            <div style={{ width: '80px', height: '6px', background: 'var(--card-bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}><div style={{ height: '100%', width: `${branchPct}%`, background: s.color }}></div></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, width: '40px', textAlign: 'right', color: branchPct > 0 ? 'var(--text)' : 'var(--text3)' }}>%{branchPct}</span>
                            <i className={`fas fa-chevron-${isBranchOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', opacity: 0.3 }}></i>
                          </div>

                          {isBranchOpen && (
                            <div style={{ padding: '4px 0 12px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {s.units.map((unit, ui) => {
                                    let unitC = 0, unitW = 0;
                                    unit.topics.forEach((_, ti) => {
                                        const d = state.units[`${s.id}_u${ui}_t${ti}`] || { correct: 0, wrong: 0 };
                                        unitC += d.correct; unitW += d.wrong;
                                    });
                                    const unitPct = (unitC + unitW) ? Math.round((unitC / (unitC + unitW)) * 100) : 0;
                                    const isUnitOpen = openUnits[`${s.id}_${ui}`] !== false; // Active by default

                                    return (
                                        <div key={ui} style={{ borderLeft: `2px solid ${s.color}20`, marginLeft: '4px' }}>
                                            <div 
                                                onClick={() => setOpenUnits(p => ({ ...p, [`${s.id}_${ui}`]: !isUnitOpen }))}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer' }}
                                            >
                                                <i className={`fas fa-caret-${isUnitOpen ? 'down' : 'right'}`} style={{ color: s.color, fontSize: '0.8rem' }}></i>
                                                <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{unit.name}</span>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: s.color, background: `${s.color}15`, padding: '2px 6px', borderRadius: '4px' }}>%{unitPct}</span>
                                            </div>

                                            {isUnitOpen && (
                                                <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {unit.topics.map((topic, ti) => {
                                                        const ud = state.units[`${s.id}_u${ui}_t${ti}`] || { correct: 0, wrong: 0, lastDate: null };
                                                        const isDusty = isUnitDusty(s.id, ui, ti);

                                                        return (
                                                            <div key={ti} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{topic}</span>
                                                                    {isDusty && (
                                                                        <span title="Tozlanmış: 15+ gündür çalışılmadı!" style={{ color: '#f59e0b', fontSize: '0.7rem' }}>
                                                                            <i className="fas fa-wind animate-pulse"></i>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', userSelect: 'none' }}>
                                                                        <span style={{ color: '#3dd68c', fontWeight: 700 }}>{ud.correct}D</span>
                                                                        <span style={{ color: '#f43f5e', fontWeight: 700 }}>{ud.wrong}Y</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                                        <button className="btn btn-ghost" style={{ padding: '3px 6px', fontSize: '10px' }} onClick={() => { setCurrentAction({ sid: s.id, ui, ti, subjectName: s.name, unitName: unit.name, topicName: topic }); setSolveData({ correct: 0, wrong: 0 }); initDateTime(); setSolveModalOpen(true); }}>Soru</button>
                                                                        <button className="btn btn-ghost" style={{ padding: '3px 6px', fontSize: '10px' }} onClick={() => { setCurrentAction({ sid: s.id, ui, ti, subjectName: s.name, unitName: unit.name, topicName: topic }); initDateTime(); setStudyModalOpen(true); }}>Çalış</button>
                                                                        {isAnalysisEditMode && (
                                                                            <button 
                                                                                onClick={() => { setEditUnitData({ correct: ud.correct, wrong: ud.wrong, sid: s.id, ui, ti, topicName: topic, unitName: unit.name, subjectName: s.name }); setEditModalOpen(true); }}
                                                                                style={{ padding: '4px 8px', borderRadius: '8px', color: 'var(--accent)', fontSize: '0.8rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', cursor: 'pointer', animation: 'fadeIn 0.3s ease' }}
                                                                                className="hover-bg-btn"
                                                                                title="İstatistikleri Düzenle"
                                                                            >
                                                                                <i className="fas fa-pen"></i>
                                                                            </button>
                                                                        )}
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
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => { setGoalDateKey(todayKey); initDateTime(); setAddGoalModalOpen(true); }}>+ Yeni Hedef Ekle</button>
                </div>
              </div>
            </div>

            {/* Timeline Journal */}
            <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-history" style={{ color: 'var(--accent)' }}></i> Ders Çalışma Günlüğü</h3>
              <div style={{ position: 'relative', paddingLeft: '30px' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>{mergedHistory.map((event: any) => { const dateObj = new Date(event.date); const label = `${dateObj.getHours() || '00'}:${dateObj.getMinutes().toString().padStart(2, '0')} - ${dateObj.toLocaleDateString('tr-TR')}`; const isDb = typeof event.id === 'string'; const configMap: any = { solve: { icon: 'fa-check', bg: '#10b981', label: 'Soru Çözümü' }, study: { icon: 'fa-stopwatch', bg: '#6366f1', label: 'Konu Tanımı' }, exam: { icon: 'fa-file-signature', bg: '#f59e0b', label: 'Deneme Girişi' } }; const config = configMap[event.type] || { icon: 'fa-info', bg: 'var(--accent)', label: 'Bilgi' }; return (<div key={event.id} style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: config.bg, border: '3px solid var(--bg)', zIndex: 2 }}></div><div className="hover-bg" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', position: 'relative' }}>{!isDb && event.type !== 'exam' && <button onClick={() => removeHistoryItem(event.id)} style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text3)', fontSize: '0.8rem', opacity: 0.5, border: 'none', background: 'transparent', cursor: 'pointer' }} className="hover-bg-btn" title="Kaydı Sil"><i className="fas fa-trash-can"></i></button>}<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><span style={{ fontSize: '0.65rem', fontWeight: 800, color: config.bg, textTransform: 'uppercase' }}>{config.label} {isDb && '(DB)'}</span><span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 600 }}>{label}</span></div>{event.type === 'solve' && <div><p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.subject} <span style={{ color: 'var(--text2)', fontWeight: 500 }}>- {event.unit}</span></p><p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '4px' }}>{event.topic}</p><p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}><span style={{ color: '#3dd68c' }}>{event.correct} Doğru</span> • <span style={{ color: '#f43f5e' }}>{event.wrong} Yanlış</span></p></div>}{event.type === 'study' && <div><p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.subject} <span style={{ color: 'var(--text2)', fontWeight: 500 }}>- {event.unit}</span></p><p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '4px' }}>{event.topic}</p><p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, marginTop: '4px' }}>{event.duration} dakika çalışıldı</p></div>}{event.type === 'exam' && <div><p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.name}</p><p style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800, marginTop: '4px' }}>{event.net} Net</p></div>}</div></div>); })}</div>
              </div>
            </div>
          </div>
        ) : (
          <div key="planlama" className="animate-fade" style={{ contain: 'content', isolation: 'isolate' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Modern Monthly Calendar */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><i className="fas fa-calendar-alt"></i></div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Haftalık Çalışma Takvimi</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {currentCalendarMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => {
                        const target = new Date(currentCalendarMonth);
                        target.setDate(target.getDate() - 7);
                        setCurrentCalendarMonth(target);
                    }} className="hover-bg-btn" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', color: 'var(--text)' }}><i className="fas fa-chevron-left"></i></button>
                    <button onClick={() => setCurrentCalendarMonth(new Date())} className="hover-bg-btn" style={{ padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', background: 'transparent', color: 'var(--text)' }}>Bugün</button>
                    <button onClick={() => {
                        const target = new Date(currentCalendarMonth);
                        target.setDate(target.getDate() + 7);
                        setCurrentCalendarMonth(target);
                    }} className="hover-bg-btn" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', color: 'var(--text)' }}><i className="fas fa-chevron-right"></i></button>
                  </div>
                </div>

                {/* Weekdays Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', padding: '8px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {(() => {
                    const timelineStart = new Date(currentCalendarMonth);
                    // Start from Monday of the current week if it hasn't been navigated
                    let dayIdx = timelineStart.getDay() - 1;
                    if (dayIdx === -1) dayIdx = 6;
                    timelineStart.setDate(timelineStart.getDate() - dayIdx);
                    
                    const cells = [];
                    for (let i = 0; i < 7; i++) {
                        const date = new Date(timelineStart);
                        date.setDate(timelineStart.getDate() + i);
                        const dateKey = formatDateKey(date);
                        cells.push({ day: date.getDate(), dateKey, dateObj: date });
                    }

                    return cells.map((cell, idx) => {
                      const dayGoals = state.agenda[cell.dateKey] || [];
                      const isSelected = selectedCalendarDate === cell.dateKey;
                      const isToday = cell.dateKey === todayKey;
                      const dayName = cell.dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedCalendarDate(cell.dateKey)}
                          onDoubleClick={() => { setSelectedCalendarDate(cell.dateKey); setDayDetailModalOpen(true); }}
                          style={{ 
                            flex: 1,
                            minHeight: '160px',
                            padding: '10px 6px', 
                            borderRadius: '16px', 
                            border: isToday ? '2px solid var(--accent)' : (isSelected ? '1px solid var(--accent-glow)' : '1px solid var(--border)'),
                            background: isToday ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            overflow: 'hidden',
                            boxShadow: isToday ? '0 0 20px var(--accent-glow)' : 'none'
                          }}
                          className="hover-bg grow-safe"
                        >
                          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>{dayName}</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: isToday ? 'var(--accent)' : 'var(--text)' }}>{cell.day}</p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                            {dayGoals.map((g: any, i: number) => {
                                const typeColors: any = { solve: 'var(--blue)', study: 'var(--green)', custom: '#f59e0b' };
                                const color = typeColors[g.type] || 'var(--accent)';
                                return (
                                    <div key={i} style={{ 
                                        fontSize: '0.5rem', 
                                        padding: '4px 6px', 
                                        borderRadius: '6px', 
                                        background: g.done ? 'rgba(255,255,255,0.05)' : `${color}20`,
                                        color: g.done ? 'var(--text3)' : color,
                                        borderLeft: `3px solid ${g.done ? 'var(--text3)' : color}`,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontWeight: 800,
                                        textDecoration: g.done ? 'line-through' : 'none'
                                    }}>
                                        {g.text}
                                    </div>
                                );
                            })}
                          </div>

                          <button 
                                onClick={(e) => { e.stopPropagation(); setGoalDateKey(cell.dateKey); initDateTime(); setAddGoalModalOpen(true); }}
                                style={{ width: '100%', padding: '4px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)', color: 'var(--text3)', fontSize: '0.6rem', cursor: 'pointer' }}
                                className="hover-bg-btn"
                          >
                                <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Monthly Mini Card - Bottom Left */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '20px', width: '300px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => {
                              const target = new Date(currentCalendarMonth);
                              target.setMonth(target.getMonth() - 1);
                              setCurrentCalendarMonth(target);
                          }} className="hover-bg-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px' }}><i className="fas fa-chevron-left" style={{ fontSize: '0.7rem' }}></i></button>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text2)' }}>AYLIK ÖZET</h4>
                          <button onClick={() => {
                              const target = new Date(currentCalendarMonth);
                              target.setMonth(target.getMonth() + 1);
                              setCurrentCalendarMonth(target);
                          }} className="hover-bg-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i></button>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 800 }}>{currentCalendarMonth.toLocaleDateString('tr-TR', { month: 'long' })}</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                      {(() => {
                        const year = currentCalendarMonth.getFullYear();
                        const month = currentCalendarMonth.getMonth();
                        const firstDay = new Date(year, month, 1);
                        const lastDay = new Date(year, month + 1, 0);
                        let startIdx = firstDay.getDay() - 1;
                        if (startIdx === -1) startIdx = 6;
                        
                        const miniCells = [];
                        const prevEnd = new Date(year, month, 0).getDate();
                        for (let i = startIdx; i > 0; i--) {
                          const d = new Date(year, month - 1, prevEnd - i + 1);
                          miniCells.push({ d: d.getDate(), k: formatDateKey(d), cur: false });
                        }
                        for (let i = 1; i <= lastDay.getDate(); i++) {
                          const d = new Date(year, month, i);
                          miniCells.push({ d: i, k: formatDateKey(d), cur: true });
                        }
                        
                        return miniCells.map((c, i) => {
                            const hasGoals = (state.agenda[c.k] || []).length > 0;
                            const isSel = selectedCalendarDate === c.k;
                            return (
                                <div key={i} 
                                  onClick={() => { setSelectedCalendarDate(c.k); setCurrentCalendarMonth(new Date(c.k)); }} 
                                  onDoubleClick={() => { setSelectedCalendarDate(c.k); setDayDetailModalOpen(true); }}
                                  style={{ 
                                    aspectRatio: '1', 
                                    fontSize: '0.65rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    background: isSel ? 'var(--accent)' : (c.cur ? 'rgba(255,255,255,0.03)' : 'transparent'),
                                    color: isSel ? 'black' : (c.cur ? 'var(--text)' : 'var(--text3)'),
                                    position: 'relative',
                                    transition: 'all 0.2s ease'
                                }} className="hover-bg">
                                    {c.d}
                                    {hasGoals && !isSel && <div style={{ position: 'absolute', bottom: '2px', width: '3px', height: '3px', borderRadius: '50%', background: 'var(--accent)' }}></div>}
                                </div>
                            );
                        });
                      })()}
                    </div>
                </div>

                {/* Placeholder for future features */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: '24px', opacity: 0.3 }}>
                    <div style={{ textAlign: 'center' }}>
                        <i className="fas fa-plus-circle" style={{ fontSize: '2rem', marginBottom: '12px' }}></i>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Buraya yeni özellikler gelecek...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Modals outside with absolute viewport-fixed positioning */}
      {isAddGoalModalOpen && (
        <div className="modal-overlay open" onClick={() => setAddGoalModalOpen(false)}>
          <div className="glass-card modal-content" style={{ padding: '24px', maxWidth: '440px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Yeni Hedef Planla</h3><p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{agendaDays.find(d => d.dateKey === goalDateKey)?.label} için hedef ekliyorsun</p></div>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg)', padding: '4px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                {[{ id: 'solve', label: 'Soru', icon: 'fa-check' }, { id: 'study', label: 'Çalışma', icon: 'fa-stopwatch' }, { id: 'custom', label: 'Özel', icon: 'fa-pen' }].map(t => (<button key={t.id} onClick={() => setGoalType(t.id as any)} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, background: goalType === t.id ? 'var(--accent)' : 'transparent', color: goalType === t.id ? 'white' : 'var(--text3)', border: 'none', cursor: 'pointer' }}><i className={`fas ${t.icon}`}></i> {t.label}</button>))}
            </div>
            {goalType !== 'custom' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="input-label">Branş / Ders</label>
                        <select className="input" value={goalSubject.id} onChange={(e) => { 
                            const sub = SUBJECT_DATA.find(s => s.id === e.target.value); 
                            if (sub) { 
                                setGoalSubject(sub); 
                                setGoalUnit(sub.units[0]); 
                                setGoalTopic(sub.units[0].topics[0]);
                            } 
                        }}>
                            {SUBJECT_DATA.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label className="input-label">Ünite</label>
                            <select className="input" value={goalUnit.name} onChange={(e) => {
                                const unit = goalSubject.units.find(u => u.name === e.target.value);
                                if (unit) {
                                    setGoalUnit(unit);
                                    setGoalTopic(unit.topics[0]);
                                }
                            }}>
                                {goalSubject.units.map((u, i) => <option key={i} value={u.name}>{u.name.split(':')[0]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Konu</label>
                            <select className="input" value={goalTopic} onChange={(e) => setGoalTopic(e.target.value)}>
                                {goalUnit.topics.map((t, i) => <option key={i} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="input-label">{goalType === 'solve' ? 'Hedef Soru Sayısı' : 'Hedef Süre (Dakika)'}</label><input type="number" className="input" placeholder={goalType === 'solve' ? "Örn: 50" : "Örn: 40"} value={goalValue} onChange={(e) => setGoalValue(e.target.value)} /></div>
                </div>
            ) : (<div><label className="input-label">Özel Hedef Notu</label><textarea className="input" style={{ minHeight: '80px', resize: 'none' }} placeholder="Örn: Bugün genel deneme çözülecek..." value={goalCustomText} onChange={(e) => setGoalCustomText(e.target.value)}></textarea></div>)}
            <div style={{ marginTop: '16px' }}>
                <label className="input-label">Hedef Zamanı (24S)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-ghost" style={{ padding: '10px', width: '40px', height: '40px', justifyContent: 'center' }} onClick={() => changeDateTimeDay(-1)}><i className="fas fa-chevron-left"></i></button>
                    <div className="input" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{new Date(selectedDateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
                    <button className="btn btn-ghost" style={{ padding: '10px', width: '40px', height: '40px', justifyContent: 'center' }} onClick={() => changeDateTimeDay(1)}><i className="fas fa-chevron-right"></i></button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                        <input type="number" min="0" max="23" className="input" style={{ width: '50px', textAlign: 'center', padding: '8px 4px' }} value={getHHMM().h} onChange={(e) => updateTime(e.target.value, getHHMM().m)} />
                        <span style={{ fontWeight: 800 }}>:</span>
                        <input type="number" min="0" max="59" className="input" style={{ width: '50px', textAlign: 'center', padding: '8px 4px' }} value={getHHMM().m} onChange={(e) => updateTime(getHHMM().h, e.target.value)} />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}><button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAddGoalModalOpen(false)}>Vazgeç</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addNewGoal}>Hedefi Ekle</button></div>
          </div>
        </div>
      )}

      {isDayDetailModalOpen && (
        <div className="modal-overlay open" onClick={() => setDayDetailModalOpen(false)}>
          <div className="glass-card modal-content" style={{ padding: '24px', maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Günlük Plan Özeti</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 600 }}>{new Date(selectedCalendarDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</p>
                </div>
                <button onClick={() => setDayDetailModalOpen(false)} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text)', cursor: 'pointer' }} className="hover-bg-btn"><i className="fas fa-times"></i></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {(state.agenda[selectedCalendarDate] || []).length > 0 ? (state.agenda[selectedCalendarDate] || []).map((goal: any) => (
                    <div key={goal.id} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '18px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                        <div onClick={() => toggleAgendaGoal(selectedCalendarDate, goal.id)} style={{ width: '24px', height: '24px', borderRadius: '8px', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: goal.done ? 'var(--accent)' : 'transparent', borderColor: goal.done ? 'var(--accent)' : 'var(--border)' }}>
                            {goal.done && <i className="fas fa-check" style={{ fontSize: '10px', color: 'white' }}></i>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: goal.done ? 'var(--text3)' : 'var(--text)', textDecoration: goal.done ? 'line-through' : 'none' }}>{goal.text}</p>
                            {goal.time && <p style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 600 }}><i className="fas fa-clock"></i> {goal.time}</p>}
                        </div>
                        <button onClick={() => removeGoal(selectedCalendarDate, goal.id)} style={{ padding: '8px', color: 'var(--text3)', fontSize: '0.9rem', opacity: 0.5 }} className="hover-bg-btn"><i className="fas fa-trash-can"></i></button>
                    </div>
                )) : <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}><i className="fas fa-calendar-day" style={{ fontSize: '2.5rem', marginBottom: '16px' }}></i><p style={{ fontWeight: 600 }}>Henüz bir planlama yok.</p></div>}
            </div>

            <button 
                onClick={() => { setDayDetailModalOpen(false); setGoalDateKey(selectedCalendarDate); initDateTime(); setAddGoalModalOpen(true); }}
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
            >
                <i className="fas fa-plus"></i> Yeni Hedef Ekle
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setDayDetailModalOpen(false)}>Kapat</button>
          </div>
        </div>
      )}

      {isSolveModalOpen && (
        <div className="modal-overlay open" onClick={() => setSolveModalOpen(false)}>
          <div className="glass-card modal-content" style={{ padding: '24px', maxWidth: '440px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>{currentAction?.subjectName}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{currentAction?.unitName}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentAction?.topicName}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}><div><label className="input-label">Doğru</label><input type="number" className="input" value={solveData.correct} onChange={e => setSolveData({ ...solveData, correct: parseInt(e.target.value) || 0 })} /></div><div><label className="input-label">Yanlış</label><input type="number" className="input" value={solveData.wrong} onChange={e => setSolveData({ ...solveData, wrong: parseInt(e.target.value) || 0 })} /></div></div>
            <div style={{ marginBottom: '24px' }}>
                <label className="input-label">Çözüm Zamanı (24S)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-ghost" style={{ padding: '10px', width: '40px', height: '40px', justifyContent: 'center' }} onClick={() => changeDateTimeDay(-1)}><i className="fas fa-chevron-left"></i></button>
                    <div className="input" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{new Date(selectedDateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
                    <button className="btn btn-ghost" style={{ padding: '10px', width: '40px', height: '40px', justifyContent: 'center' }} onClick={() => changeDateTimeDay(1)}><i className="fas fa-chevron-right"></i></button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                        <input type="number" min="0" max="23" className="input" style={{ width: '50px', textAlign: 'center', padding: '8px 4px' }} value={getHHMM().h} onChange={(e) => updateTime(e.target.value, getHHMM().m)} />
                        <span style={{ fontWeight: 800 }}>:</span>
                        <input type="number" min="0" max="59" className="input" style={{ width: '50px', textAlign: 'center', padding: '8px 4px' }} value={getHHMM().m} onChange={(e) => updateTime(getHHMM().h, e.target.value)} />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}><button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSolveModalOpen(false)}>İptal</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveSolve}>Kaydet</button></div>
          </div>
        </div>
      )}

      {isStudyModalOpen && (
        <div className="modal-overlay open" onClick={() => setStudyModalOpen(false)}>
          <div className="glass-card modal-content" style={{ padding: '24px', maxWidth: '440px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '4px', fontWeight: 800 }}>Konu Çalışma</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{currentAction?.subjectName} - {currentAction?.unitName}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '20px' }}>{currentAction?.topicName}</p>
            <div style={{ background: 'var(--accent-dim)', padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '16px' }}><div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '10px' }}>{formatTime(timerSeconds)}</div><button className={`btn ${isTimerRunning ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsTimerRunning(!isTimerRunning)}>{isTimerRunning ? 'Duraklat' : 'Başlat'}</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label className="input-label">Dakika</label><input type="number" className="input" value={studyMinutes} onChange={e => setStudyMinutes(parseInt(e.target.value) || 0)} placeholder="Dakika..." /></div>
                <div style={{ flex: 2 }}>
                    <label className="input-label">Zaman (24S)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button className="btn btn-ghost" style={{ padding: '4px', width: '28px', height: '28px', justifyContent: 'center' }} onClick={() => changeDateTimeDay(-1)}><i className="fas fa-chevron-left" style={{ fontSize: '0.7rem' }}></i></button>
                        <div className="input" style={{ flex: 1, fontSize: '0.7rem', padding: '8px 4px', textAlign: 'center' }}>{new Date(selectedDateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</div>
                        <button className="btn btn-ghost" style={{ padding: '4px', width: '28px', height: '28px', justifyContent: 'center' }} onClick={() => changeDateTimeDay(1)}><i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i></button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                            <input type="number" min="0" max="23" className="input" style={{ width: '38px', textAlign: 'center', padding: '6px 2px', fontSize: '0.75rem' }} value={getHHMM().h} onChange={(e) => updateTime(e.target.value, getHHMM().m)} />
                            <span style={{ fontWeight: 800 }}>:</span>
                            <input type="number" min="0" max="59" className="input" style={{ width: '38px', textAlign: 'center', padding: '6px 2px', fontSize: '0.75rem' }} value={getHHMM().m} onChange={(e) => updateTime(getHHMM().h, e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}><button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setIsTimerRunning(false); setSelectedDateTime(""); setStudyModalOpen(false); }}>İptal</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { addHistory('study', { subject: currentAction.subjectName, unit: currentAction.unitName, topic: currentAction.topicName, duration: studyMinutes }, selectedDateTime ? new Date(selectedDateTime).toISOString() : undefined); setStudyMinutes(0); setTimerSeconds(0); setIsTimerRunning(false); setSelectedDateTime(""); setStudyModalOpen(false); }}>Kaydet</button></div>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {SUBJECT_DATA.map(sub => {
                    const total = state.history.filter((h: any) => h.type === 'solve' && h.subject === sub.name).reduce((sum: number, s: any) => sum + (s.correct + s.wrong), 0);
                    return (
                        <div key={sub.id} className="glass-card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `3px solid ${sub.color}`, minHeight: '40px' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 0 }}>{sub.name}</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: 0 }}>{total} <span style={{ fontSize: '0.6rem', color: 'var(--text3)', fontWeight: 600 }}>Soru</span></p>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay open" onClick={() => setEditModalOpen(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>İstatistikleri Düzenle</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>{editUnitData.subjectName} - {editUnitData.unitName}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{editUnitData.topicName}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                    <label className="input-label">Toplam Doğru</label>
                    <input type="number" className="input" value={editUnitData.correct} onChange={e => setEditUnitData({ ...editUnitData, correct: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                    <label className="input-label">Toplam Yanlış</label>
                    <input type="number" className="input" value={editUnitData.wrong} onChange={e => setEditUnitData({ ...editUnitData, wrong: parseInt(e.target.value) || 0 })} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAddGoalModalOpen(false)}>İptal</button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={updateUnitStats}>Güncelle</button>
                </div>
                <button 
                  className="btn btn-ghost" 
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', border: '1px solid rgba(244, 63, 94, 0.2)' }} 
                  onClick={resetUnitStats}
                >
                    <i className="fas fa-trash-can" style={{ marginRight: '6px' }}></i> Verileri Sıfırla
                </button>
            </div>
          </div>
        </div>
      )}

      </div>

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
