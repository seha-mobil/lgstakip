'use client';

import React, { useState, useEffect } from 'react';

interface CountdownCardProps {
  targetDate: string;
  title: string;
  color?: string;
}

export default function CountdownCard({ targetDate, title, color = '#FFFFFF' }: CountdownCardProps) {
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
      padding: '8px 14px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '0px', 
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${color}20`,
      boxShadow: `0 0 10px ${color}10`,
      minWidth: '130px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Scan Line Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.2,
        animation: 'scan-anim 4s linear infinite'
      }}></div>

      <style>{`
        @keyframes scan-anim {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(100px); }
        }
        @keyframes heartbeat-glow {
          0% { text-shadow: 0 0 5px ${color}40, 0 0 10px ${color}20; }
          15% { text-shadow: 0 0 12px ${color}CC, 0 0 25px ${color}80, 0 0 35px ${color}40; }
          30% { text-shadow: 0 0 5px ${color}40, 0 0 10px ${color}20; }
          45% { text-shadow: 0 0 10px ${color}AA, 0 0 20px ${color}60; }
          100% { text-shadow: 0 0 5px ${color}40, 0 0 10px ${color}20; }
        }
        .glow-heartbeat {
          color: ${color};
          font-family: var(--mono);
          line-height: 1;
          animation: heartbeat-glow 1s ease-in-out infinite;
        }
      `}</style>

      <div style={{ fontSize: '9px', fontWeight: 800, color: color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
        {title}
      </div>

      {/* Large Days Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
        <div className="glow-heartbeat" style={{ fontSize: '42px', fontWeight: 900 }}>
          {timeLeft.d}
        </div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: color, opacity: 0.8, marginTop: '-2px' }}>GÜN KALDI</div>
      </div>

      <div style={{ width: '80%', height: '1px', background: `${color}15`, marginBottom: '6px' }}></div>

      {/* HMS Section */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <MiniUnit val={timeLeft.h} label="S" color={color} />
        <span style={{ color: color, opacity: 0.2, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.m} label="D" color={color} />
        <span style={{ color: color, opacity: 0.2, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.s} label="Sn" color={color} isSn />
      </div>
    </div>
  );
}

function MiniUnit({ val, label, color, isSn = false }: { val: number; label: string; color: string; isSn?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="glow-heartbeat" style={{ 
        fontSize: '14px', 
        fontWeight: 700,
        minWidth: '20px',
        textAlign: 'center'
      }}>
        {val.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: '7px', fontWeight: 600, color: color, opacity: 0.4 }}>{label}</div>
    </div>
  );
}
