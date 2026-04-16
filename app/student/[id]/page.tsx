export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProgressChart, SubjectBarChart, NetRadarChart } from '@/components/ClientCharts';
import { deleteExamResult, getExamAverages } from '@/app/actions';
import PastExamsTable from './PastExamsTable';
import SubjectStatsTable from '@/components/SubjectStatsTable';
import LiseTargetPicker from '@/components/LiseTargetPicker';
import RemoveTargetButton from '@/components/RemoveTargetButton';
import AnalysisHoverCard from '@/components/AnalysisHoverCard';
import ReportShareButton from '@/components/ReportShareButton';

export default async function StudentDetail({ params }: { params: { id: string } }) {
  // ... existing code ...
  // Auth check
  const cookieStore = cookies();
  const auth = cookieStore.get(`student_auth_${params.id}`);
  if (!auth) redirect(`/student/${params.id}/login`);

  let student: any = null;
  let dbError = false;

  try {
    student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        examResults: {
          include: { subjects: true, trialExam: true },
          orderBy: { date: 'asc' }
        }
      }
    });
  } catch (error) {
    console.error(`Database error for student ${params.id}:`, error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="page animate-fade-up">
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ marginBottom: '16px' }}>Bağlantı Sorunu 📡</h2>
          <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 24px' }}>
            Öğrenci verileri şu anda yüklenemiyor. Veritabanı bağlantısı kurulamadı.
          </p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '12px 32px', textDecoration: 'none' }}>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!student) return <div className="page">Öğrenci bulunamadı.</div>;

  const exams = student.examResults;
  const bestExam = exams.length ? [...exams].sort((a: any, b: any) => b.lgsPuani - a.lgsPuani)[0] : null;
  const lastExam = exams.length ? exams[exams.length - 1] : null;
  const prevExam = exams.length > 1 ? exams[exams.length - 2] : null;
  const avgScore = exams.length ? exams.reduce((acc: any, ex: any) => acc + ex.lgsPuani, 0) / exams.length : 0;
  
  const targetName = student.targetLiseName;
  const targetPuan = student.targetLisePuan;
  
  // Progress logic: 400 is base (0%), 500 is target (100%).
  // So 450 is 50%.
  const basePuan = 400;
  const DIFFICULTY_FACTOR = 1.5;
  const rawRatio = targetPuan && targetPuan > basePuan 
    ? Math.max(0, Math.min(1, (avgScore - basePuan) / (targetPuan - basePuan))) 
    : 0;
  const progressPct = Math.pow(rawRatio, DIFFICULTY_FACTOR) * 100;
  const remainingPuan = targetPuan ? Math.max(0, targetPuan - avgScore) : 0;

  // Calculate personal subject averages
  const personalAverages: Record<string, number> = {};
  const totals: Record<string, { sum: number, count: number }> = {};
  
  exams.forEach((ex: any) => {
    ex.subjects.forEach((sub: any) => {
      if (!totals[sub.subjectKey]) totals[sub.subjectKey] = { sum: 0, count: 0 };
      totals[sub.subjectKey].sum += Math.max(0, sub.dogru - (sub.yanlis / 3));
      totals[sub.subjectKey].count += 1;
    });
  });
  
  Object.keys(totals).forEach(key => {
    personalAverages[key] = totals[key].sum / totals[key].count;
  });

  return (
    <div className="page animate-fade-up">
      <div className="flex-mobile-col" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: student.color, width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 }}></div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>{student.name}</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{exams.length} deneme kaydı</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <LiseTargetPicker 
            studentId={student.id} 
            currentName={student.targetLiseName} 
            currentPuan={student.targetLisePuan} 
          />
          {exams.length > 1 && (
            <Link href={"/student/" + student.id + "/exam-compare"} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '12px' }}>
              <i className="fas fa-balance-scale"></i> Karşılaştır
            </Link>
          )}
          {exams.length > 0 && (
            <>
              <ReportShareButton studentId={student.id} studentName={student.name} />
              <a href={"/student/" + student.id + "/print"} target="_blank" className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '12px' }}>
                <i className="fas fa-print"></i> Yazdır
              </a>
            </>
          )}
          <Link href={"/student/" + student.id + "/add-exam"} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <i className="fas fa-plus"></i> Yeni Deneme
          </Link>
        </div>
      </div>

      {targetPuan && (
        <div className="glass-card animate-fade-up" style={{ 
          padding: '24px', 
          marginBottom: '20px', 
          background: 'linear-gradient(135deg, rgba(232, 184, 75, 0.08) 0%, rgba(30, 45, 66, 0.4) 100%)',
          border: '1px solid rgba(232, 184, 75, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>HEDEF YOLCULUĞU</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>{targetName}</h3>
              </div>
              <div style={{ marginTop: '18px' }}>
                <RemoveTargetButton studentId={student.id} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>%{progressPct.toFixed(1).replace('.', ',')}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{targetPuan.toFixed(1)} Hedef Puan</div>
            </div>
          </div>
          
          <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressPct}%`, 
              background: 'var(--accent)', 
              boxShadow: '0 0 15px var(--accent-glow)',
              transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>
              Şu anki ortalaman: <b style={{ color: 'var(--text2)' }}>{avgScore.toFixed(2).replace('.', ',')}</b>
            </p>
            {remainingPuan > 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--accent)' }}>
                Hedefe <b style={{ fontSize: '14px' }}>{remainingPuan.toFixed(2).replace('.', ',')}</b> puan kaldı
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 800 }}>
                HEDEFE ULAŞILDI! 🏆
              </p>
            )}
          </div>
        </div>
      )}

      {!exams.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div className="animate-float" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--text3)', marginBottom: '18px' }}>
            <i className="fas fa-file-circle-plus"></i>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text2)', marginBottom: '6px' }}>Henüz deneme eklenmedi</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>Yeni bir deneme ekleyerek takibe başlayın</div>
          <Link href={"/student/" + student.id + "/add-exam"} className="btn btn-primary">
            <i className="fas fa-plus"></i> Yeni Deneme Ekle
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <AnalysisHoverCard 
              student={student}
              lastExam={lastExam} 
              prevExam={prevExam} 
              targetPuan={student.targetLisePuan}
              studentColor={student.color}
            />
            <AnalysisHoverCard 
              student={student}
              lastExam={{
                trialExam: { name: 'Genel Ortalama' },
                lgsPuani: avgScore,
                subjects: Object.keys(personalAverages).map(key => ({
                  subjectKey: key,
                  dogru: personalAverages[key],
                  yanlis: 0
                }))
              }}
              targetPuan={student.targetLisePuan}
              studentColor={student.color}
              isAverage={true}
            />
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.14s' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>En Yüksek ({bestExam!.trialExam.name})</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: bestExam!.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{bestExam!.lgsPuani.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <div className="glass-card animate-fade-up" style={{ padding: '24px', marginBottom: '20px', animationDelay: '0.18s' }}>
            <div className="sec-title">Puan İlerlemesi</div>
            <div style={{ position: 'relative', height: '250px' }}>
              <ProgressChart exams={exams} color={student.color} />
            </div>
          </div>

          <div className="glass-card animate-fade-up" style={{ padding: '24px', marginBottom: '20px', animationDelay: '0.21s' }}>
            <div className="sec-title">Total Başarı İstatistikleri</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px', marginTop: '-10px' }}>Tüm denemelerin toplam ders bazlı dağılımı</div>
            <SubjectStatsTable exams={exams} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.28s' }}>
              <div className="sec-title">Sözel Net Dağılımı</div>
              <div style={{ position: 'relative', height: '200px' }}>
                <SubjectBarChart exams={exams} subjects={['Turkce', 'Inkilap', 'Dinkultur', 'Ingilizce']} title="Sözel Bölüm" color="var(--purple)" />
              </div>
            </div>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.35s' }}>
              <div className="sec-title">Sayısal Net Dağılımı</div>
              <div style={{ position: 'relative', height: '200px' }}>
                <SubjectBarChart exams={exams} subjects={['Matematik', 'Fen']} title="Sayısal Bölüm" color="var(--blue)" />
              </div>
            </div>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.42s' }}>
              <div className="sec-title">Son Deneme Radar</div>
              <div style={{ position: 'relative', height: '200px' }}>
                <NetRadarChart exams={exams} color={student.color} />
              </div>
            </div>
          </div>

          <div className="glass-card animate-fade-up" style={{ padding: '24px', animationDelay: '0.49s' }}>
            <div className="sec-title">Geçmiş Denemeler (Yeniye Doğru)</div>
            <PastExamsTable 
              student={student}
              exams={exams} 
              studentId={student.id} 
              studentColor={student.color} 
              personalAverages={personalAverages} 
            />
          </div>
        </>
      )}
    </div>
  );
}
