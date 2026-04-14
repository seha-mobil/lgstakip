import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProgressChart, SubjectBarChart, NetRadarChart } from '@/components/ClientCharts';
import { deleteExamResult, getExamAverages } from '@/app/actions';
import PastExamsTable from './PastExamsTable';
import SubjectStatsTable from '@/components/SubjectStatsTable';

export default async function StudentDetail({ params }: { params: { id: string } }) {
  // Auth check
  const cookieStore = cookies();
  const auth = cookieStore.get(`student_auth_${params.id}`);
  if (!auth) redirect(`/student/${params.id}/login`);

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      examResults: {
        include: { trialExam: true, subjects: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!student) return <div className="page">Öğrenci bulunamadı.</div>;

  const exams = student.examResults;
  const bestExam = exams.length ? [...exams].sort((a,b) => b.lgsPuani - a.lgsPuani)[0] : null;
  const lastExam = exams.length ? exams[exams.length - 1] : null;
  const avgScore = exams.length ? exams.reduce((acc, ex) => acc + ex.lgsPuani, 0) / exams.length : 0;
  
  // Calculate personal subject averages
  const personalAverages: Record<string, number> = {};
  const totals: Record<string, { sum: number, count: number }> = {};
  
  exams.forEach(ex => {
    ex.subjects.forEach(sub => {
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
          {exams.length > 1 && (
            <Link href={"/student/" + student.id + "/exam-compare"} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '12px' }}>
              <i className="fas fa-balance-scale"></i> Karşılaştır
            </Link>
          )}
          {exams.length > 0 && (
            <a href={"/student/" + student.id + "/print"} target="_blank" className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '12px' }}>
              <i className="fas fa-print"></i> Yazdır
            </a>
          )}
          <Link href={"/student/" + student.id + "/add-exam"} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <i className="fas fa-plus"></i> Yeni Deneme
          </Link>
        </div>
      </div>

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
            <div className="glass-card animate-fade-up" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>Son Deneme ({lastExam!.trialExam.name})</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: lastExam!.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{lastExam!.lgsPuani.toFixed(2).replace('.', ',')}</div>
            </div>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.07s' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>Ortalama Puan</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)' }}>{avgScore.toFixed(2).replace('.', ',')}</div>
            </div>
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
