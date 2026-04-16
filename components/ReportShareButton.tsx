'use client';

import { useState, useEffect } from 'react';

interface ReportShareButtonProps {
  studentId: string;
  studentName: string;
}

export default function ReportShareButton({ studentId, studentName }: ReportShareButtonProps) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setShareUrl(`${origin}/student/${studentId}/print`);
    }
  }, [studentId]);

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `Merhaba, ${studentName} öğrencimizin güncel LGS gelişim raporuna buradan ulaşabilirsiniz:\n\n${shareUrl}`
  )}`;

  return (
    <a 
      href={whatsappLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="btn btn-ghost" 
      style={{ 
        padding: '8px 12px', 
        fontSize: '12px', 
        color: '#3dd68c', 
        background: 'rgba(61, 214, 140, 0.1)',
        border: '1px solid rgba(61, 214, 140, 0.2)'
      }}
    >
      <i className="fab fa-whatsapp"></i> Veliye Gönder
    </a>
  );
}
