'use client';

import React, { useState, useEffect } from 'react';

interface CountdownCardProps {
  targetDate: string;
  title: string;
}

const MATRIX_GREEN = '#00FF41';

export default function CountdownCard({ targetDate, title }: CountdownCardProps) {
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
      padding: '16px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '2px', 
      background: 'rgba(0, 15, 0, 0.7)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${MATRIX_GREEN}30`,
      boxShadow: `0 0 15px ${MATRIX_GREEN}15`,
      minWidth: '160px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Matrix Scan Line Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${MATRIX_GREEN}, transparent)`,
        opacity: 0.3,
        animation: 'matrix-scan 4s linear infinite'
      }}></div>

      <style>{`
        @keyframes matrix-scan {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(120px); }
        }
        .matrix-text {
          color: ${MATRIX_GREEN};
          text-shadow: 0 0 8px ${MATRIX_GREEN}80, 0 0 15px ${MATRIX_GREEN}40;
          font-family: var(--mono);
          line-height: 1;
        }
      `}</style>

      <div style={{ fontSize: '9px', fontWeight: 800, color: MATRIX_GREEN, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        {title}
      </div>

      {/* Large Days Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
        <div className="matrix-text" style={{ fontSize: '48px', fontWeight: 900 }}>
          {timeLeft.d}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: MATRIX_GREEN, opacity: 0.9, marginTop: '-2px' }}>GÜN KALDI</div>
      </div>

      <div style={{ width: '100%', height: '1px', background: `${MATRIX_GREEN}20`, marginBottom: '10px' }}></div>

      {/* HMS Section */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <MiniUnit val={timeLeft.h} label="SA" />
        <span style={{ color: MATRIX_GREEN, opacity: 0.3, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.m} label="DK" />
        <span style={{ color: MATRIX_GREEN, opacity: 0.3, fontWeight: 900, marginTop: '-4px' }}>:</span>
        <MiniUnit val={timeLeft.s} label="SN" isSn />
      </div>
    </div>
  );
}

function MiniUnit({ val, label, isSn = false }: { val: number; label: string; isSn?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="matrix-text" style={{ 
        fontSize: '16px', 
        fontWeight: 700,
        opacity: isSn ? 1 : 0.8,
        minWidth: '22px',
        textAlign: 'center'
      }}>
        {val.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: '7px', fontWeight: 600, color: MATRIX_GREEN, opacity: 0.5 }}>{label}</div>
    </div>
  );
}
