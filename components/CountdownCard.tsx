'use client';

import React, { useState, useEffect } from 'react';

interface CountdownCardProps {
  targetDate: string;
  title: string;
  color?: string;
}

export default function CountdownCard({ targetDate, title, color = '#00FF41' }: CountdownCardProps) {
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

  // Derive styles from the color prop
  const glowStyle = {
    color: color,
    textShadow: `0 0 8px ${color}80, 0 0 15px ${color}40`,
  };

  return (
    <div className="glass-card" style={{ 
      padding: '16px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '2px', 
      background: 'rgba(0, 0, 0, 0.4)', // Darker background for pop
      backdropFilter: 'blur(20px)',
      border: `1px solid ${color}30`,
      boxShadow: `0 0 15px ${color}15`,
      minWidth: '160px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Scan Line Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.3,
        animation: 'scan-anim 4s linear infinite'
      }}></div>

      <style>{`
        @keyframes scan-anim {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(120px); }
        }
        .glow-text {
          font-family: var(--mono);
          line-height: 1;
        }
      `}</style>

      <div style={{ fontSize: '9px', fontWeight: 800, color: color, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        {title}
      </div>

      {/* Large Days Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
        <div className="glow-text" style={{ ...glowStyle, fontSize: '48px', fontWeight: 900 }}>
          {timeLeft.d}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: color, opacity: 0.9, marginTop: '-2px' }}>GÜN KALDI</div>
      </div>

      <div style={{ width: '100%', height: '1px', background: `${color}20`, marginBottom: '10px' }}></div>

      {/* HMS Section */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <MiniUnit val={timeLeft.h} label="SA" color={color} glowStyle={glowStyle} />
        <span style={{ color: color, opacity: 0.3, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.m} label="DK" color={color} glowStyle={glowStyle} />
        <span style={{ color: color, opacity: 0.3, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.s} label="SN" color={color} glowStyle={glowStyle} isSn />
      </div>
    </div>
  );
}

function MiniUnit({ val, label, color, glowStyle, isSn = false }: { val: number; label: string; color: string; glowStyle: any; isSn?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="glow-text" style={{ 
        ...glowStyle,
        fontSize: '16px', 
        fontWeight: 700,
        opacity: isSn ? 1 : 0.8,
        minWidth: '22px',
        textAlign: 'center'
      }}>
        {val.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: '7px', fontWeight: 600, color: color, opacity: 0.5 }}>{label}</div>
    </div>
  );
}
