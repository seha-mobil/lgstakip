'use client';

import React, { useState, useEffect } from 'react';

interface CountdownCardProps {
  targetDate: string;
  title: string;
  color?: string;
}

export default function CountdownCard({ targetDate, title, color = 'var(--accent)' }: CountdownCardProps) {
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

  if (!timeLeft) return null;

  return (
    <div className="glass-card" style={{ 
      padding: '12px 16px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px', 
      borderLeft: `3px solid ${color}`,
      background: 'rgba(255,255,255,0.02)',
      minWidth: '180px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '4px', borderRadius: '6px', background: `${color}20`, color: color, fontSize: '10px' }}>
          <i className="fas fa-clock"></i>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.5px' }}>{title}</span>
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
        <Unit val={timeLeft.d} label="G" color={color} />
        <Dot />
        <Unit val={timeLeft.h} label="S" color={color} />
        <Dot />
        <Unit val={timeLeft.m} label="D" color={color} />
        <Dot />
        <Unit val={timeLeft.s} label="Sn" color={color} isLast />
      </div>
    </div>
  );
}

function Unit({ val, label, color, isLast = false }: { val: number; label: string; color: string; isLast?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: 900, 
        fontFamily: 'var(--mono)', 
        color: isLast ? color : 'var(--text)',
        minWidth: '24px',
        textAlign: 'center'
      }}>
        {val.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: '8px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function Dot() {
  return <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--border)', marginTop: '-8px' }}>:</div>;
}
