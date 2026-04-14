import { prisma } from '@/lib/prisma';
import ExamsClient from './ExamsClient';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const trialExams = await prisma.trialExam.findMany({
    include: {
      _count: {
        select: { examResults: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-clipboard-list"></i>
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Deneme Yönetimi</h2>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>Sistemdeki tüm denemeleri düzenleyin veya silin</p>
        </div>
      </div>
      
      <ExamsClient initialExams={trialExams} />
    </div>
  );
}
