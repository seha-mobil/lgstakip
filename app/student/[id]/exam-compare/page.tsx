import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompareExamsClient from './CompareExamsClient';

export default async function StudentExamCompare({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      examResults: {
        include: { trialExam: true, subjects: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!student) notFound();

  if (student.examResults.length < 2) {
    return (
      <div className="page animate-fade-up">
        <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '24px' }}>Karşılaştırma Yapılamıyor</h2>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>En az 2 deneme kaydı gereklidir.</div>
        <Link href={"/student/" + student.id} className="btn btn-ghost">Geri Dön</Link>
      </div>
    );
  }

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <Link href={"/student/" + student.id} className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Deneme Karşılaştırma</h2>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{student.name}</p>
        </div>
      </div>

      <CompareExamsClient exams={student.examResults} studentColor={student.color} />
    </div>
  );
}
