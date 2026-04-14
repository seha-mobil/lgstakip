import { prisma } from '@/lib/prisma';
import ExamsClient from './ExamsClient';
import CountdownCard from '@/components/CountdownCard';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const trialExams = await prisma.trialExam.findMany({
    include: { _count: { select: { examResults: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const students = await prisma.student.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="page animate-fade-up">
      <div className="flex-mobile-col" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            <i className="fas fa-hammer"></i>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>Yönetim Paneli</h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>Sistem ayarlarını ve öğrenci hesaplarını yönetin</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <CountdownCard targetDate="2026-06-13T09:30:00" title="LGS 2026" color="#FFFFFF" labelColor="#FFFFFF" />
          <CountdownCard targetDate="2027-06-11T09:30:00" title="LGS 2027" color="#FF8C00" labelColor="#FFFFFF" />
        </div>
      </div>
      
      <ExamsClient initialExams={trialExams} students={students} />
    </div>
  );
}
