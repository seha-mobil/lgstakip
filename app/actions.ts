'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const COLORS = ['#e8b84b','#4d8ef0','#3dd68c','#f05a5a','#a78bfa','#ec4899','#2dd4bf','#f97316','#6366f1','#84cc16'];

export async function addStudent(name: string) {
  const count = await prisma.student.count();
  const color = COLORS[count % COLORS.length];
  await prisma.student.create({ data: { name, color } });
  revalidatePath('/');
}

export async function removeStudent(id: string) {
  await prisma.student.delete({ where: { id } });
  revalidatePath('/');
}

export async function getStudents() {
  return await prisma.student.findMany({
    include: { examResults: { orderBy: { date: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTrialExams() {
  return await prisma.trialExam.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addTrialExam(name: string) {
  const exam = await prisma.trialExam.create({ data: { name } });
  revalidatePath('/');
  return exam;
}

export async function deleteExamResult(studentId: string, examResultId: string) {
  await prisma.examResult.delete({ where: { id: examResultId } });
  revalidatePath(`/student/${studentId}`);
  revalidatePath('/');
}

export async function saveExamResult(studentId: string, data: any) {
  let trialExamId = data.trialExamId;
  const examDate = new Date(data.date);

  // If trialExamId is "NEW", we need to create one using the provided newTrialName
  if (trialExamId === 'NEW') {
    const exam = await prisma.trialExam.create({
      data: { 
        name: data.newTrialName,
        date: examDate 
      }
    });
    trialExamId = exam.id;
  } else {
    // Update the existing trial exam's date so it syncs for future selections
    await prisma.trialExam.update({
      where: { id: trialExamId },
      data: { date: examDate }
    });
  }

  const result = await prisma.examResult.create({
    data: {
      studentId: studentId,
      trialExamId: trialExamId,
      date: examDate,
      ogrenciSayisi: Number(data.ogrenciSayisi),
      basariSirasi: Number(data.basariSirasi),
      toplamNet: Number(data.toplamNet),
      lgsPuani: Number(data.lgsPuani),
      subjects: {
        create: data.subjects.map((sub: any) => ({
          subjectKey: sub.key,
          dogru: Number(sub.dogru),
          yanlis: Number(sub.yanlis)
        }))
      }
    }
  });

  revalidatePath(`/student/${studentId}`);
  redirect(`/student/${studentId}`);
}

export async function updateTrialExam(id: string, data: { name: string, date: string }) {
  await prisma.trialExam.update({
    where: { id },
    data: { name: data.name, date: new Date(data.date) }
  });
  revalidatePath('/');
  revalidatePath('/exams');
}

export async function deleteTrialExam(id: string) {
  // Manually delete dependent exam results to bypass potential DB constraint issues
  await prisma.examResult.deleteMany({
    where: { trialExamId: id }
  });

  await prisma.trialExam.delete({
    where: { id }
  });
  revalidatePath('/');
  revalidatePath('/exams');
}

export async function createStandaloneTrialExam(name: string, date: string) {
  const exam = await prisma.trialExam.create({
    data: {
      name,
      date: new Date(date)
    }
  });
  revalidatePath('/');
  revalidatePath('/exams');
  return exam;
}
