'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const COLORS = ['#e8b84b','#4d8ef0','#3dd68c','#f05a5a','#a78bfa','#ec4899','#2dd4bf','#f97316','#6366f1','#84cc16'];

export async function addStudent(name: string, password?: string) {
  const count = await prisma.student.count();
  const color = COLORS[count % COLORS.length];
  await prisma.student.create({ 
    data: { 
      name, 
      color,
      password: password || '123456'
    } 
  });
  revalidatePath('/');
  revalidatePath('/exams');
}

export async function updateStudent(id: string, data: any) {
  await prisma.student.update({
    where: { id },
    data
  });
  revalidatePath('/');
  revalidatePath('/exams');
  revalidatePath(`/student/${id}`);
}

export async function removeStudent(id: string) {
  await prisma.student.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/exams');
}

export async function syncDatabaseSchema() {
  try {
    // Add password column if missing
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "password" TEXT DEFAULT '123456';`);
    
    // Add Target Lise columns if missing
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "targetLiseName" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "targetLisePuan" DOUBLE PRECISION;`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Schema sync error:', error);
    return { success: false, error: error.message };
  }
}

export async function loginStudent(studentId: string, password: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });

  if (student && student.password === password) {
    cookies().set(`student_auth_${studentId}`, 'true', {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    return { success: true };
  }
  return { success: false, error: 'Hatalı şifre!' };
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

    // DUPLICATE PREVENTION (MERGE LOGIC): 
    // If student already has a result for this trial exam, delete the old one first
    await prisma.examResult.deleteMany({
      where: { studentId: studentId, trialExamId: trialExamId }
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
  revalidatePath('/');
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

function parseTRNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(',', '.');
  return parseFloat(str) || 0;
}

export async function importExcelData(parsedRows: any[]) {
  const colors = ['#e84b4b', '#e8b84b', '#3dd68c', '#a855f7', '#3b82f6'];
  let colorIdx = 0;

  for (const row of parsedRows) {
    if (!row['Öğrenci'] || !row['Sınav']) continue;

    // 1. Get or Create Student
    const studentName = String(row['Öğrenci'] || '').trim();
    if (!studentName) continue;

    let student = await prisma.student.findFirst({
      where: { name: { equals: studentName, mode: 'insensitive' } }
    });
    if (!student) {
      const colorsLoc = ['#e84b4b', '#e8b84b', '#3dd68c', '#a855f7', '#3b82f6'];
      student = await prisma.student.create({
        data: {
          name: studentName,
          color: colorsLoc[colorIdx % colorsLoc.length]
        }
      });
      colorIdx++;
    }

    // 2. Get or Create TrialExam
    const examName = String(row['Sınav'] || '').trim();
    if (!examName) continue;

    let examDate = new Date();
    if (row['Tarih']) {
      examDate = new Date(row['Tarih']);
      if (isNaN(examDate.getTime())) examDate = new Date();
    }
    
    let trialExam = await prisma.trialExam.findFirst({
      where: { name: examName }
    });
    if (!trialExam) {
      trialExam = await prisma.trialExam.create({
        data: { name: examName, date: examDate }
      });
    } else if (!trialExam.date && row['Tarih']) {
       // Update date if it was missing
       trialExam = await prisma.trialExam.update({
         where: { id: trialExam.id },
         data: { date: examDate }
       });
    }

    // Double check we have both
    if (!student || !trialExam) continue;

    // 3. Clear Existing ExamResult for this student+exam to avoid duplicates
    await prisma.examResult.deleteMany({
      where: { studentId: student.id, trialExamId: trialExam.id }
    });

    // 4. Create ExamResult
    const examResult = await prisma.examResult.create({
      data: {
        studentId: student.id,
        trialExamId: trialExam.id,
        date: trialExam.date || new Date(),
        ogrenciSayisi: 0,
        basariSirasi: 0,
        lgsPuani: parseTRNumber(row['LGS'] || 0),
        toplamNet: parseTRNumber(row['Net'] || 0),
      }
    });

    // 5. Create Subject Results
    const subjectsMap = [
      { key: 'Turkce', d: 'Türkçe D', y: 'Türkçe Y' },
      { key: 'Inkilap', d: 'İnkılap D', y: 'İnkılap Y' },
      { key: 'Dinkultur', d: 'Din D', y: 'Din Y' },
      { key: 'Matematik', d: 'Mat D', y: 'Mat Y' },
      { key: 'Fen', d: 'Fen D', y: 'Fen Y' },
      { key: 'Ingilizce', d: 'İng D', y: 'İng Y' },
    ];

    for (const sub of subjectsMap) {
      const d = parseTRNumber(row[sub.d]);
      const y = parseTRNumber(row[sub.y]);
      await prisma.subjectResult.create({
        data: {
          examResultId: examResult.id,
          subjectKey: sub.key.toLowerCase(),
          dogru: d,
          yanlis: y
        }
      });
    }
  }

  revalidatePath('/exams');
  return { success: true, count: parsedRows.length };
}

export async function getExamAverages() {
  const allResults = await prisma.examResult.findMany({
    include: { subjects: true }
  });

  const trialGroups: Record<string, Record<string, { totalNet: number, count: number }>> = {};

  allResults.forEach(res => {
    if (!trialGroups[res.trialExamId]) trialGroups[res.trialExamId] = {};
    res.subjects.forEach(sub => {
      const net = Math.max(0, sub.dogru - (sub.yanlis / 3));
      if (!trialGroups[res.trialExamId][sub.subjectKey]) {
        trialGroups[res.trialExamId][sub.subjectKey] = { totalNet: 0, count: 0 };
      }
      trialGroups[res.trialExamId][sub.subjectKey].totalNet += net;
      trialGroups[res.trialExamId][sub.subjectKey].count += 1;
    });
  });

  const averages: Record<string, Record<string, number>> = {};
  Object.keys(trialGroups).forEach(trialId => {
    averages[trialId] = {};
    Object.keys(trialGroups[trialId]).forEach(subKey => {
      const g = trialGroups[trialId][subKey];
      averages[trialId][subKey] = g.totalNet / g.count;
    });
  });

  return averages;
}

export async function updateExamResult(studentId: string, examResultId: string, data: any) {
  const SUBJECT_COEFFS: Record<string, number> = {
    turkce: 2.024,
    inkilap: 1.018,
    dinkultur: 0.512,
    ingilizce: 0.512,
    matematik: 3.992,
    fen: 3.992
  };
  const MAX_WEIGHTED = 220.58;
  const LGS_MIN = 180;
  const LGS_MAX = 500;

  let weightedSum = 0;
  let totalNet = 0;

  for (const sub of data.subjects) {
    const net = Math.max(0, sub.dogru - (sub.yanlis / 3));
    weightedSum += net * (SUBJECT_COEFFS[sub.key] || 0);
    totalNet += net;
  }

  const lgsPuani = Math.round(((weightedSum / MAX_WEIGHTED) * (LGS_MAX - LGS_MIN) + LGS_MIN) * 100) / 100;

  await prisma.$transaction([
    prisma.examResult.update({
      where: { id: examResultId },
      data: {
        toplamNet: Math.round(totalNet * 100) / 100,
        lgsPuani
      }
    }),
    ...data.subjects.map((sub: any) => 
      prisma.subjectResult.updateMany({
        where: { examResultId, subjectKey: sub.key },
        data: { dogru: sub.dogru, yanlis: sub.yanlis }
      })
    )
  ]);

  revalidatePath(`/student/${studentId}`);
}
