'use client';

import { useState, useEffect, useRef } from 'react';

const MODES = {
  FOCUS: { label: 'Odaklan', time: 25 * 60, color: 'var(--accent)' },
  SHORT_BREAK: { label: 'Kısa Mola', time: 5 * 60, color: '#10b981' },
  LONG_BREAK: { label: 'Uzun Mola', time: 15 * 60, color: '#6366f1' }
};

export default function PomodoroPage() {
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Notify user
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`${MODES[mode as keyof typeof MODES].label} Bitti!`, {
        body: mode === 'FOCUS' ? 'Mola verme zamanı.' : 'Çalışmaya devam!'
      });
    } else {
      alert(`${MODES[mode as keyof typeof MODES].label} Bitti!`);
    }

    if (mode === 'FOCUS') {
      setPomodoros(prev => prev + 1);
      setMode('SHORT_BREAK');
      setTimeLeft(MODES.SHORT_BREAK.time);
    } else {
      setMode('FOCUS');
      setTimeLeft(MODES.FOCUS.time);
    }
  };

  const toggleTimer = () => {
    if (!isActive && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode as keyof typeof MODES].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const changeMode = (newMode: string) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode as keyof typeof MODES].time);
  };

  return (
    <div className="page animate-fade-up">
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Odaklanma Zamanı ⏳</h1>
          <p style={{ opacity: 0.6 }}>Pomodoro tekniği ile dikkatini topla, verimini artır.</p>
        </header>

        <div className="glass-card" style={{ padding: '60px 40px', borderRadius: '40px', border: '1px solid var(--accent-glow)' }}>
          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
            {Object.keys(MODES).map((k) => (
              <button
                key={k}
                onClick={() => changeMode(k)}
                style={{
                  padding: '8px 20px', borderRadius: '12px', border: '1px solid transparent',
                  background: mode === k ? 'var(--accent-dim)' : 'transparent',
                  color: mode === k ? 'var(--accent)' : 'var(--text3)',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                {MODES[k as keyof typeof MODES].label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div style={{ 
            fontSize: '100px', fontWeight: 900, fontFamily: 'var(--mono)', 
            letterSpacing: '-4px', color: 'var(--text)', marginBottom: '40px',
            textShadow: '0 0 40px var(--accent-glow)', transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
          }}>
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              onClick={toggleTimer}
              style={{
                width: '180px', height: '60px', borderRadius: '18px',
                background: isActive ? 'transparent' : 'var(--accent)',
                color: isActive ? 'var(--accent)' : '#fff',
                border: isActive ? '2px solid var(--accent)' : 'none',
                fontSize: '18px', fontWeight: 800, cursor: 'pointer',
                boxShadow: isActive ? 'none' : '0 10px 30px var(--accent-dim)',
                transition: 'all 0.3s'
              }}
            >
              {isActive ? 'Duraklat' : 'Başlat'}
            </button>
            <button 
              onClick={resetTimer}
              style={{
                width: '60px', height: '60px', borderRadius: '18px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: 'var(--text3)', fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              <i className="fas fa-undo"></i>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '15px 30px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.5, display: 'block', marginBottom: '4px' }}>TAMAMLANAN</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>{pomodoros} Odak</span>
          </div>
          <div className="glass-card" style={{ padding: '15px 30px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.5, display: 'block', marginBottom: '4px' }}>HEDEF</span>
            <span style={{ fontSize: '24px', fontWeight: 800 }}>8 Odak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
