import { getStudents } from '@/app/actions';
import Link from 'next/link';

export default async function Dashboard() {
  const students = await getStudents();
  
  const totalExams = students.reduce((acc, s) => acc + s.examResults.length, 0);
  const allScores = students.flatMap(s => s.examResults.map(e => e.lgsPuani));
  const avgScore = allScores.length ? (allScores.reduce((a,b)=>a+b,0)/allScores.length).toFixed(1) : '—';
  const bestScore = allScores.length ? Math.max(...allScores).toFixed(2) : '—';

  return (
    <div className="page animate-fade-up">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.8px' }}>Ana Sayfa</h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '3px' }}>LGS deneme takip özetiniz</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon="fa-users" label="Öğrenci Sayısı" val={students.length} color="var(--blue)" delay={0} />
        <StatCard icon="fa-file-alt" label="Toplam Deneme" val={totalExams} color="var(--purple)" delay={1} />
        <StatCard icon="fa-chart-line" label="Ortalama Puan" val={avgScore} color="var(--accent)" delay={2} />
        <StatCard icon="fa-trophy" label="En Yüksek Puan" val={bestScore} color="var(--green)" delay={3} />
      </div>

      {!students.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div className="animate-float" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--text3)', marginBottom: '18px' }}>
            <i className="fas fa-user-plus"></i>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text2)', marginBottom: '6px' }}>Henüz öğrenci eklenmedi</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Sol menüden ilk öğrencinizi ekleyerek başlayın</div>
        </div>
      ) : (
        <>
          <div className="sec-title" style={{ marginBottom: '14px' }}>Öğrenciler</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {students.map((s, i) => {
              const lastExam = s.examResults[s.examResults.length - 1];
              const prevExam = s.examResults.length > 1 ? s.examResults[s.examResults.length - 2] : null;
              const trend = lastExam && prevExam ? lastExam.lgsPuani - prevExam.lgsPuani : 0;
              
              return (
                <Link href={"/student/" + s.id} key={s.id} className="glass-card animate-fade-up" style={{ padding: '20px', textDecoration: 'none', color: 'inherit', display: 'block', animationDelay: (0.1 + i * 0.05) + "s" }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700 }}>
                      <div style={{ background: s.color, width: '11px', height: '11px', borderRadius: '50%' }}></div>
                      {s.name}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.examResults.length} deneme</span>
                  </div>
                  
                  {lastExam ? (
                    <>
                      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                        <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', color: lastExam.lgsPuani >= 400 ? 'var(--green)' : 'var(--accent)' }}>
                          {lastExam.lgsPuani.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Son Deneme Puanı</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text3)' }}>Ort. Net <b style={{ color: 'var(--text2)' }}>{lastExam.toplamNet}</b></span>
                        {trend > 0 && <span style={{ color: 'var(--green)', fontSize: '11px' }}><i className="fas fa-caret-up"></i> +{trend.toFixed(1)}</span>}
                        {trend < 0 && <span style={{ color: 'var(--red)', fontSize: '11px' }}><i className="fas fa-caret-down"></i> {trend.toFixed(1)}</span>}
                        {trend === 0 && <span style={{ color: 'var(--text3)', fontSize: '11px' }}>—</span>}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '24px 0', textAlign: 'center' }}>
                      <i className="fas fa-file-circle-plus" style={{ fontSize: '22px', color: 'var(--text3)', display: 'block', marginBottom: '8px' }}></i>
                      <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Henüz deneme yok</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, val, color, delay }: { icon: string, label: string, val: any, color: string, delay: number }) {
  return (
    <div className="glass-card animate-fade-up" style={{ padding: '20px', animationDelay: (delay * 0.07) + "s" }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: "color-mix(in srgb, " + color + " 15%, transparent)", color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '12px' }}>
        <i className={"fas " + icon}></i>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>{val}</div>
      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text3)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}
