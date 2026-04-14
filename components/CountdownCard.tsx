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

  // Dynamic pulse duration calculation (fewer days = faster heartbeat)
  const pulseDuration = useMemo(() => {
    if (!timeLeft) return 2;
    // Map days to duration: 0-7 days = 0.6s, 30 days = 1s, 100+ days = 2.5s, 300+ days = 4s
    // Formula: lower cap 0.6s, upper cap 4s
    const d = timeLeft.d;
    if (d < 7) return 0.6;
    if (d < 30) return 0.9;
    if (d < 100) return 1.5;
    if (d < 300) return 2.5;
    return 4.0;
  }, [timeLeft?.d]);

  if (!timeLeft) return null;

  return (
    <div className="glass-card" style={{ 
      padding: '10px 16px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '0px', 
      background: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${color}20`,
      boxShadow: `0 0 10px ${color}10`,
      minWidth: '135px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes scan-anim {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(110px); }
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
          animation: heartbeat-glow ${pulseDuration}s ease-in-out infinite;
        }
      `}</style>
      
      {/* Decorative Scan Line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.2,
        animation: 'scan-anim 4s linear infinite'
      }}></div>

      {/* Title */}
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 900, 
        color: labelColor, 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        marginBottom: '6px',
        textAlign: 'center'
      }}>
        {title}
      </div>

      {/* Large Days Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
        <div className="glow-heartbeat" style={{ fontSize: '42px', fontWeight: 900 }}>
          {timeLeft.d}
        </div>
        <div style={{ fontSize: '9px', fontWeight: 800, color: labelColor, marginTop: '-2px' }}>GÜN KALDI</div>
      </div>

      <div style={{ width: '80%', height: '1px', background: `${color}15`, marginBottom: '6px' }}></div>

      {/* HMS Section */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <MiniUnit val={timeLeft.h} label="S" color={color} labelColor={labelColor} />
        <span style={{ color: color, opacity: 0.2, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.m} label="D" color={color} labelColor={labelColor} />
        <span style={{ color: color, opacity: 0.2, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.s} label="Sn" color={color} labelColor={labelColor} />
      </div>
    </div>
  );
}

function MiniUnit({ val, label, color, labelColor }: { val: number; label: string; color: string; labelColor: string }) {
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
      <div style={{ fontSize: '7px', fontWeight: 600, color: labelColor, opacity: 0.7 }}>{label}</div>
    </div>
  );
}
