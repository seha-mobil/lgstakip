import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DersPlaniClient from './DersPlaniClient';

export default async function DersPlaniPage({ params }: { params: { id: string } }) {
  // Auth check
  const cookieStore = cookies();
  const auth = cookieStore.get(`student_auth_${params.id}`);
  if (!auth) redirect(`/student/${params.id}/login`);

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      examResults: {
        include: { trialExam: true },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!student) redirect('/');

  // Transform DB exams to a consistent format for the client
  const dbExams = student.examResults.map(exam => ({
    id: exam.id,
    type: 'exam',
    name: exam.trialExam?.name || 'Genel Deneme',
    net: exam.toplamNet,
    date: exam.date.toISOString()
  }));

  return (
    <DersPlaniClient 
      studentName={student.name} 
      studentId={params.id}
      dbExams={dbExams} 
    />
  );
}
