'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownCardProps {
  targetDate: string;
  title: string;
  color?: string;
  labelColor?: string;
}

export default function CountdownCard({ 
  targetDate, 
  title, 
  color = '#FFFFFF', 
  labelColor = 'rgba(255,255,255,0.7)' 
}: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) return null;

      return {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Dramatically varied pulse duration (Logarithmic-like scaling for higher impact)
  const pulseDuration = useMemo(() => {
    if (!timeLeft) return 3;
    const d = timeLeft.d;
    
    // Scale:
    // < 7 days: 0.4s (Panic)
    // < 30 days: 0.7s (Urgent)
    // < 100 days (LGS 2026): 1.1s (Fast Heartbeat)
    // < 200 days: 2.5s (Noticeable)
    // < 400 days: 5.0s (Very Calm)
    // > 400 days (LGS 2027): 8.0s (Almost Still)
    
    if (d < 7) return 0.4;
    if (d < 30) return 0.7;
    if (d < 100) return 1.1; 
    if (d < 200) return 2.5;
    if (d < 400) return 5.0;
    return 8.0; 
  }, [timeLeft?.d]);

  if (!timeLeft) return null;

  return (
    <div className="glass-card" style={{ 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '12px', 
      border: `1px solid rgba(255,255,255,0.08)`,
      background: 'rgba(10, 13, 20, 0.95)',
      minWidth: '160px',
      position: 'relative',
      borderRadius: '20px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
        @keyframes pulse-orange {
          0%, 100% { text-shadow: 0 0 10px rgba(245, 158, 11, 0.2); }
          50% { text-shadow: 0 0 25px rgba(245, 158, 11, 0.5); }
        }
      `}</style>
      
      {/* Scan Line Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '40%',
        background: `linear-gradient(180deg, transparent, rgba(245, 158, 11, 0.05), transparent)`,
        animation: 'scan-line 5s linear infinite'
      }}></div>

      {/* Title with Subtle Glow */}
      <div style={{ 
        fontSize: '12px', 
        fontWeight: 800, 
        color: 'var(--text3)', 
        textTransform: 'uppercase', 
        letterSpacing: '3px', 
        textAlign: 'center',
        opacity: 0.8
      }}>
        {title}
      </div>

      {/* Days Section - High Contrast Orange */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ 
          fontSize: '56px', 
          fontWeight: 900, 
          color: '#F59E0B', 
          lineHeight: 1,
          fontFamily: 'var(--mono)',
          animation: `pulse-orange ${pulseDuration}s ease-in-out infinite`
        }}>
          {timeLeft.d}
        </div>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          color: 'var(--text3)', 
          marginTop: '4px',
          letterSpacing: '1px'
        }}>GÜN KALDI</div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>

      {/* HMS Section - Boxed Units */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <BoxUnit val={timeLeft.h} label="S" />
        <span style={{ color: 'var(--text3)', opacity: 0.3, fontWeight: 900, fontSize: '18px' }}>:</span>
        <BoxUnit val={timeLeft.m} label="D" />
        <span style={{ color: 'var(--text3)', opacity: 0.3, fontWeight: 900, fontSize: '18px' }}>:</span>
        <BoxUnit val={timeLeft.s} label="Sn" />
      </div>
    </div>
  );
}

function BoxUnit({ val, label }: { val: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '8px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 800,
        color: '#F59E0B',
        fontFamily: 'var(--mono)'
      }}>
        {val.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text3)', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}
