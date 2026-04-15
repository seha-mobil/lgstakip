'use client';

import React, { useState } from 'react';
import ExamAnalysisModal from './ExamAnalysisModal';

interface AnalysisHoverCardProps {
  student: any;
  lastExam: any;
  prevExam?: any;
  targetPuan?: number | null;
  studentColor: string;
  isAverage?: boolean;
}

export default function AnalysisHoverCard({ student, lastExam, prevExam, targetPuan, studentColor, isAverage }: AnalysisHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Quick stats for the preview card
  const currentPuan = lastExam.lgsPuani;
  const prevPuan = prevExam ? prevExam.lgsPuani : currentPuan;
  const scoreDiff = currentPuan - prevPuan;

  return (
    <>
      {/* The Trigger Card */}
      <div 
        className="glass-card animate-fade-up" 
        onClick={() => setIsOpen(true)}
        style={{ 
          padding: '20px', 
          cursor: 'pointer', 
          border: '1px solid var(--border)', 
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px) scale(1.02)';
          (e.currentTarget as HTMLElement).style.borderColor = studentColor;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px ${studentColor}25`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'none';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>{isAverage ? 'ORTALAMA PUAN GÖRÜNÜMÜ' : `SON DENEME (${lastExam.trialExam.name})`}</span>
          <span style={{ color: 'var(--accent)', fontSize: '10px', opacity: 0.7 }}>TIKLA VE İNCELE <i className="fas fa-hand-pointer"></i></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: lastExam.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>
            {lastExam.lgsPuani.toFixed(2).replace('.', ',')}
          </div>
          {!isAverage && prevExam && scoreDiff !== 0 && (
            <div style={{ fontSize: '14px', fontWeight: 800, color: scoreDiff > 0 ? '#3dd68c' : '#f05a5a' }}>
              <i className={`fas fa-caret-${scoreDiff > 0 ? 'up' : 'down'}`}></i> {Math.abs(scoreDiff).toFixed(1)}
            </div>
          )}
        </div>
        
        {/* Subtle Shine Effect on Card */}
        <div style={{ 
          position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', 
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', 
          animation: 'shine 3s infinite', pointerEvents: 'none'
        }} />
      </div>

      <ExamAnalysisModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        student={student}
        exam={lastExam}
        prevExam={prevExam}
        targetPuan={targetPuan}
        studentColor={studentColor}
        isAverage={isAverage}
      />
    </>
  );
}
