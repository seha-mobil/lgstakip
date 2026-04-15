export interface SubjectInfo {
  key: string;
  name: string;
  questions: number;
}

export const SUBJECTS: SubjectInfo[] = [
  { key: 'turkce', name: 'Türkçe', questions: 20 },
  { key: 'inkilap', name: 'İnkılap Tarihi', questions: 10 },
  { key: 'dinkultur', name: 'Din Kültürü', questions: 10 },
  { key: 'ingilizce', name: 'İngilizce', questions: 10 },
  { key: 'matematik', name: 'Matematik', questions: 20 },
  { key: 'fen', name: 'Fen Bilimleri', questions: 20 },
];

export interface AnalysisReport {
  type: 'TREND' | 'STRENGTH' | 'WEAKNESS' | 'TARGET';
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export function calculateNet(dogru: number, yanlis: number): number {
  return Math.max(0, dogru - (yanlis / 3));
}

// 1. Son Sınav Odaklı Analiz (Anlık Form Durumu vs. Tarihsel Ortalama)
export function getLatestAnalysis(student: any): AnalysisReport[] {
  const reports: AnalysisReport[] = [];
  const exams = student.examResults || [];
  if (exams.length === 0) return [];

  const lastExam = exams[exams.length - 1];
  
  // Sınav bazlı puan değişimi
  if (exams.length >= 2) {
    const prevExam = exams[exams.length - 2];
    const diff = lastExam.lgsPuani - prevExam.lgsPuani;
    
    if (diff > 10) {
      reports.push({ type: 'TREND', message: `Harika bir performans! Son sınavda puanını ${diff.toFixed(1)} artırdın.`, severity: 'success' });
    } else if (diff < -10) {
      reports.push({ type: 'TREND', message: `Bu sınavda ${Math.abs(diff).toFixed(1)} puanlık bir gerileme var. Hatalarını analiz etmelisin.`, severity: 'danger' });
    }
  }

  // Tarihsel Ortalamaları Hesapla
  const subjectAverages: Record<string, { totalNet: number, count: number }> = {};
  exams.forEach((exam: any) => {
    exam.subjects?.forEach((sub: any) => {
      const net = calculateNet(sub.dogru, sub.yanlis);
      if (!subjectAverages[sub.subjectKey]) subjectAverages[sub.subjectKey] = { totalNet: 0, count: 0 };
      subjectAverages[sub.subjectKey].totalNet += net;
      subjectAverages[sub.subjectKey].count += 1;
    });
  });

  // Son Sınav Sapma Analizi (Anomaly Detection)
  let biggestJumpSub = '';
  let biggestJumpDelta = -100;
  let biggestDropSub = '';
  let biggestDropDelta = 100;

  lastExam.subjects?.forEach((sub: any) => {
    const currentNet = calculateNet(sub.dogru, sub.yanlis);
    const stats = subjectAverages[sub.subjectKey];
    
    if (stats && stats.count > 1) { // En az 2 sınav olmalı ki ortalamayla kıyas anlamlı olsun
      const avgNet = stats.totalNet / stats.count;
      const delta = currentNet - avgNet;

      if (delta > biggestJumpDelta) {
        biggestJumpDelta = delta;
        biggestJumpSub = SUBJECTS.find(s => s.key === sub.subjectKey)?.name || '';
      }
      if (delta < biggestDropDelta) {
        biggestDropDelta = delta;
        biggestDropSub = SUBJECTS.find(s => s.key === sub.subjectKey)?.name || '';
      }
    }
  });

  // Raporları oluştur
  if (biggestJumpSub && biggestJumpDelta > 0.5) {
    reports.push({ 
      type: 'STRENGTH', 
      message: `Ortalamana göre en çok yükseliş gösteren ders: ${biggestJumpSub} (+${biggestJumpDelta.toFixed(1)} Net artış).`, 
      severity: 'success' 
    });
  } else if (exams.length === 1) {
    // Sadece 1 sınav varsa, en iyi dersi hala söyleyebiliriz
    let bSub = '';
    let bNet = -1;
    lastExam.subjects?.forEach((s: any) => {
        const net = calculateNet(s.dogru, s.yanlis);
        if (net > bNet) { bNet = net; bSub = SUBJECTS.find(x => x.key === s.subjectKey)?.name || ''; }
    });
    if (bSub) reports.push({ type: 'STRENGTH', message: `İlk sınavının en başarılı dersi: ${bSub} (${bNet.toFixed(1)} Net).`, severity: 'success' });
  }

  if (biggestDropSub && biggestDropDelta < -0.5) {
    reports.push({ 
      type: 'WEAKNESS', 
      message: `Bu sınavda ortalamanın en çok altında kalan ders: ${biggestDropSub} (${biggestDropDelta.toFixed(1)} Net gerileme).`, 
      severity: 'danger' 
    });
  }

  return reports;
}

// 2. Genel Ortalama Odaklı Analiz (Uzun Vadeli Performans)
export function getAverageAnalysis(student: any): AnalysisReport[] {
  const reports: AnalysisReport[] = [];
  const exams = student.examResults || [];
  if (exams.length === 0) return [];

  const avgPuan = exams.reduce((acc: number, ex: any) => acc + ex.lgsPuani, 0) / exams.length;

  // İstikrar analizi
  if (exams.length >= 3) {
    const lastThree = exams.slice(-3);
    const volatility = Math.max(...lastThree.map((e: any) => e.lgsPuani)) - Math.min(...lastThree.map((e: any) => e.lgsPuani));
    if (volatility < 15) {
      reports.push({ type: 'TREND', message: 'Çok istikrarlı bir grafiğin var. Puanların birbirine yakın seyrediyor.', severity: 'success' });
    } else {
      reports.push({ type: 'TREND', message: 'Puanların biraz dalgalı görünüyor. Motivasyonunu sabit tutmaya çalış.', severity: 'warning' });
    }
  }

  // Genel zayıf dersler (Tüm sınavların ortalaması)
  const subjectStats: Record<string, { totalNet: number, count: number }> = {};
  exams.forEach((exam: any) => {
    exam.subjects?.forEach((sub: any) => {
      const net = calculateNet(sub.dogru, sub.yanlis);
      if (!subjectStats[sub.subjectKey]) subjectStats[sub.subjectKey] = { totalNet: 0, count: 0 };
      subjectStats[sub.subjectKey].totalNet += net;
      subjectStats[sub.subjectKey].count += 1;
    });
  });

  let weakSub = '';
  let minPct = 101;
  SUBJECTS.forEach(sub => {
    const stats = subjectStats[sub.key];
    if (stats) {
      const avgNet = stats.totalNet / stats.count;
      const pct = (avgNet / sub.questions) * 100;
      if (pct < minPct) { minPct = pct; weakSub = sub.name; }
    }
  });

  if (weakSub && minPct < 60) {
    reports.push({ type: 'WEAKNESS', message: `Genel ortalamana bakıldığında ${weakSub} dersi üzerinde daha çok durman gerekiyor.`, severity: 'danger' });
  }

  // Hedef analizi
  if (student.targetLisePuan) {
    const diff = student.targetLisePuan - avgPuan;
    if (diff <= 0) {
      reports.push({ type: 'TARGET', message: 'Genel ortalaman hedef lisenin üzerinde! Harika gidiyorsun.', severity: 'success' });
    } else {
      reports.push({ type: 'TARGET', message: `Hedefine ulaşmak için genel ortalamana ${diff.toFixed(1)} puan daha eklemelisin.`, severity: 'info' });
    }
  }

  return reports;
}

// Eski fonksiyonu uyumluluk için yönlendiriyoruz
export function getStudentAnalysis(student: any): AnalysisReport[] {
  return [...getLatestAnalysis(student), ...getAverageAnalysis(student)];
}

export interface ExamDiff {
  subjectName: string;
  diff: number;
  currentNet: number;
}

export function getExamComparison(currentExam: any, prevExam?: any) {
  const diffs: ExamDiff[] = [];
  const scoreDiff = prevExam ? currentExam.lgsPuani - prevExam.lgsPuani : 0;

  SUBJECTS.forEach(sub => {
    const currentSub = currentExam.subjects?.find((s: any) => s.subjectKey === sub.key);
    const prevSub = prevExam?.subjects?.find((s: any) => s.subjectKey === sub.key);

    const currentNet = currentSub ? calculateNet(currentSub.dogru, currentSub.yanlis) : 0;
    const prevNet = prevSub ? calculateNet(prevSub.dogru, prevSub.yanlis) : 0;

    diffs.push({
      subjectName: sub.name,
      diff: currentNet - prevNet,
      currentNet
    });
  });

  return {
    scoreDiff,
    subjectDiffs: diffs
  };
}
