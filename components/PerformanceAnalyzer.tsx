'use client';

import React from 'react';
import { getStudentAnalysis, AnalysisReport } from '@/lib/analysis';

interface PerformanceAnalyzerProps {
  student: any;
}

export default function PerformanceAnalyzer({ student }: PerformanceAnalyzerProps) {
  const reports = getStudentAnalysis(student);

  const getIcon = (type: AnalysisReport['type']) => {
    switch (type) {
      case 'TREND': return 'fa-chart-line';
      case 'STRENGTH': return 'fa-award';
      case 'WEAKNESS': return 'fa-lightbulb';
      case 'TARGET': return 'fa-bullseye';
      default: return 'fa-info-circle';
    }
  };

  const getColors = (severity: AnalysisReport['severity']) => {
    switch (severity) {
      case 'success': return { bg: 'rgba(61, 214, 140, 0.1)', border: '#3dd68c', text: '#3dd68c' };
      case 'danger': return { bg: 'rgba(240, 90, 90, 0.1)', border: '#f05a5a', text: '#f05a5a' };
      case 'warning': return { bg: 'rgba(232, 184, 75, 0.1)', border: '#e8b84b', text: '#e8b84b' };
      default: return { bg: 'rgba(77, 142, 240, 0.1)', border: '#4d8ef0', text: '#4d8ef0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {reports.map((report, idx) => {
        const colors = getColors(report.severity);
        return (
          <div 
            key={idx}
            className="glass-card"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center',
              background: colors.bg,
              borderColor: `${colors.border}40`,
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '12px', 
              background: `${colors.border}20`,
              display: 'flex',
              alignItems: 'center',
              justifyChild: 'center',
              flexShrink: 0
            }}>
              <i 
                className={`fas ${getIcon(report.type)}`} 
                style={{ color: colors.text, fontSize: '20px', width: '100%', textAlign: 'center' }}
              ></i>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 800, 
                color: colors.text, 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                {report.type === 'TREND' ? 'Trend Analizi' : 
                 report.type === 'STRENGTH' ? 'Güçlü Alan' :
                 report.type === 'WEAKNESS' ? 'Gelişim Alanı' : 'Hedef Durumu'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', lineHeight: '1.5' }}>
                {report.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
