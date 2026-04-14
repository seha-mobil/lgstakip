import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProgressChart, SubjectBarChart, NetRadarChart } from '@/components/ClientCharts';
import { deleteExamResult } from '@/app/actions';

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

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
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
          {exams.length > 1 && (
            <Link href={"/student/" + student.id + "/exam-compare"} className="btn btn-ghost">
              <i className="fas fa-balance-scale"></i> Karşılaştır
            </Link>
          )}
          {exams.length > 0 && (
            <a href={"/student/" + student.id + "/print"} target="_blank" className="btn btn-ghost">
              <i className="fas fa-print"></i> Yazdır
            </a>
          )}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="glass-card animate-fade-up" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>Son Deneme ({lastExam!.trialExam.name})</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: lastExam!.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{lastExam!.lgsPuani.toFixed(2)}</div>
            </div>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.07s' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>Ortalama Puan</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)' }}>{avgScore.toFixed(2)}</div>
            </div>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: '0.14s' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)' }}>En Yüksek ({bestExam!.trialExam.name})</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: bestExam!.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{bestExam!.lgsPuani.toFixed(2)}</div>
            </div>
          </div>

          <div className="glass-card animate-fade-up" style={{ padding: '24px', marginBottom: '20px', animationDelay: '0.21s' }}>
            <div className="sec-title">Puan İlerlemesi</div>
            <div style={{ position: 'relative', height: '250px' }}>
              <ProgressChart exams={exams} color={student.color} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
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
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                    <th style={{ padding: '12px 8px' }}>Tarih</th>
                    <th style={{ padding: '12px 8px' }}>Deneme Adı</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>TR</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>İNK</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>DİN</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>İNG</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>MAT</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: '11px' }}>FEN</th>
                    <th style={{ padding: '12px 8px' }}>Top. Net</th>
                    <th style={{ padding: '12px 8px' }}>Puan</th>
                    <th style={{ padding: '12px 8px' }}>Fark</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {[...exams].reverse().map((ex) => {
                    const currentIndexInOriginal = exams.findIndex(e => e.id === ex.id);
                    const prevLgs = currentIndexInOriginal > 0 ? exams[currentIndexInOriginal - 1].lgsPuani : null;
                    const diff = prevLgs ? ex.lgsPuani - prevLgs : 0;
                    return (
                      <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--text2)' }}>{new Date(ex.date).toLocaleDateString('tr-TR')}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{ex.trialExam.name}</td>
                        {['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'].map(key => {
                          const sub = ex.subjects?.find((s:any) => s.subjectKey === key);
                          const net = sub ? Math.max(0, sub.dogru - (sub.yanlis / 4)) : 0;
                          return <td key={key} style={{ padding: '12px 8px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text2)' }}>{net}</td>;
                        })}
                        <td style={{ padding: '12px 8px', fontFamily: 'var(--mono)' }}>{ex.toplamNet}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: ex.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>{ex.lgsPuani.toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                          {prevLgs ? (
                            <span style={{ color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text3)' }}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <form action={deleteExamResult.bind(null, student.id, ex.id)} style={{ display: 'inline-block' }}>
                            <button type="submit" className="delete-btn" style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '6px', borderRadius: '4px', transition: 'all 0.2s' }}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
