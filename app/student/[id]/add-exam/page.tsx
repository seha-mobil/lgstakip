import { getTrialExams, getStudents } from '@/app/actions';
import AddExamForm from '@/components/AddExamForm';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AddExamPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id } });
  if (!student) notFound();
  
  const trialExams = await getTrialExams();

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <Link href={`/student/${student.id}`} className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Yeni Deneme Ekle</h2>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{student.name} için deneme kaydı</p>
        </div>
      </div>
      
      <AddExamForm studentId={student.id} trialExams={trialExams} />
    </div>
  );
}
