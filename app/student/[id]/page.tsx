import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ProgressChart } from '@/components/ClientCharts';

export default async function StudentDetail({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      examResults: {
        include: { trialExam: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!student) return <div className="page">Öğrenci bulunamadı.</div>;

  const exams = student.examResults;
  const bestExam = exams.length ? [...exams].sort((a,b) => b.lgsPuani - a.lgsPuani)[0] : null;
  const lastExam = exams.length ? exams[exams.length - 1] : null;

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" className="btn btn-ghost" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: student.color, width: '12px', height: '12px', borderRadius: '50%' }}></div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>{student.name}</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{exams.length} deneme kaydı</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={"/student/" + student.id + "/add-exam"} className="btn btn-primary">
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="glass-card animate-fade-up" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>Son Deneme</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: lastExam!.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{lastExam!.lgsPuani.toFixed(2)}</div>
            </div>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.07s' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>En Yüksek</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: bestExam!.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{bestExam!.lgsPuani.toFixed(2)}</div>
            </div>
          </div>

          <div className="glass-card animate-fade-up" style={{ padding: '24px', marginBottom: '20px', animationDelay: '0.14s' }}>
            <div className="sec-title">Puan İlerlemesi</div>
            <div style={{ position: 'relative', height: '250px' }}>
              <ProgressChart exams={exams} color={student.color} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
