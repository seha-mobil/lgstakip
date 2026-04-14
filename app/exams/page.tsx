import { prisma } from '@/lib/prisma';
import ExamsClient from './ExamsClient';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-hammer"></i>
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Yönetim Paneli</h2>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>Sistem ayarlarını ve öğrenci hesaplarını yönetin</p>
        </div>
      </div>
      
      <ExamsClient initialExams={trialExams} students={students} />
    </div>
  );
}
