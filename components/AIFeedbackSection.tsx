'use client';

import { useState } from 'react';
import { getAIFeedback } from '@/app/actions';

interface AIFeedbackSectionProps {
  studentId: string;
}

export default function AIFeedbackSection({ studentId }: AIFeedbackSectionProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIFeedback(studentId);
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || "Beklenmedik bir hata oluştu.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-up" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--accent-glow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', background: 'var(--accent-dim)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontSize: '18px'
          }}>
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>AI Eğitim Koçu (Beta)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Son 5 sınav verisi ve notların üzerinden analiz yapar.</p>
          </div>
        </div>
        {!analysis && !isLoading && (
          <button onClick={handleGenerateAnalysis} className="btn btn-primary" style={{ padding: '8px 20px' }}>
            Analiz Et
          </button>
        )}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="animate-spin" style={{ fontSize: '24px', color: 'var(--accent)', marginBottom: '12px' }}>
            <i className="fas fa-circle-notch"></i>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text3)' }}>Yapay zeka verilerini analiz ediyor...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: 'rgba(240, 90, 90, 0.1)', border: '1px solid rgba(240, 90, 90, 0.2)', borderRadius: '12px', color: '#f05a5a', fontSize: '13px' }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          {error}
          {error.includes("GEMINI_API_KEY") && (
            <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
              Lütfen .env dosyanıza GEMINI_API_KEY eklediğinizden emin olun.
            </div>
          )}
        </div>
      )}

      {analysis && !isLoading && (
        <div className="animate-fade-in">
          <div style={{
            maxHeight: '400px', overflowY: 'auto', padding: '16px',
            background: 'rgba(0,0,0,0.2)', borderRadius: '14px',
            fontSize: '14px', lineHeight: '1.7', color: 'var(--text2)',
            whiteSpace: 'pre-wrap', border: '1px solid var(--border)'
          }}>
            {analysis}
          </div>
          <button 
            onClick={() => setAnalysis(null)} 
            className="btn btn-ghost" 
            style={{ marginTop: '16px', fontSize: '12px', width: '100%', justifyContent: 'center' }}
          >
            Yeni Analiz İste
          </button>
        </div>
      )}
    </div>
  );
}
