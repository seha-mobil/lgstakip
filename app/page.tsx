import { getStudents } from '@/app/actions';
import Link from 'next/link';
import CountdownCard from '@/components/CountdownCard';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let students: any[] = [];
  let dbError = false;

  try {
    students = await getStudents();
  } catch (error) {
    console.error('Database fetch error on Dashboard:', error);
    dbError = true;
  }
  
  const totalExams = students.reduce((acc: any, s: any) => acc + s.examResults.length, 0);
  const allScores = students.flatMap((s: any) => s.examResults.map((e: any) => e.lgsPuani));
  const avgScore = allScores.length ? (allScores.reduce((a: any,b: any)=>a+b,0)/allScores.length).toFixed(1) : '—';
  const bestScore = allScores.length ? Math.max(...allScores).toFixed(2) : '—';

  if (dbError) {
    return (
      <div className="page animate-fade-up">
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ marginBottom: '16px' }}>Veritabanı Bağlantı Sorunu 🛰️</h2>
          <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 24px' }}>
            Şu anda veritabanına ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin veya biraz sonra tekrar deneyin.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
            style={{ padding: '12px 32px' }}
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade-up">
      <div className="flex-mobile-col" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px' }}>Ana Sayfa</h2>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '3px', whiteSpace: 'nowrap' }}>LGS deneme takip özetiniz</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <CountdownCard targetDate="2026-06-13T09:30:00" title="LGS 2026" color="#FFFFFF" labelColor="#FFFFFF" />
          <CountdownCard targetDate="2027-06-11T09:30:00" title="LGS 2027" color="#FF8C00" labelColor="#FFFFFF" />
        </div>
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
                          {lastExam.lgsPuani.toFixed(2).replace('.', ',')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Son Deneme Puanı</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text3)' }}>Son Net <b style={{ color: 'var(--text2)' }}>{lastExam.toplamNet.toString().replace('.', ',')}</b></span>
                        {trend > 0 && <span style={{ color: 'var(--green)', fontSize: '11px' }}><i className="fas fa-caret-up"></i> +{trend.toFixed(1).replace('.', ',')}</span>}
                        {trend < 0 && <span style={{ color: 'var(--red)', fontSize: '11px' }}><i className="fas fa-caret-down"></i> {trend.toFixed(1).replace('.', ',')}</span>}
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
          
          <div className="ticker-container" style={{ marginTop: '32px' }}>
            <div className="ticker-wrapper">
              <div className="ticker-item"><i className="fas fa-users"></i> Öğrenci Sayısı <b>{students.length}</b></div>
              <div className="ticker-dot"></div>
              <div className="ticker-item"><i className="fas fa-file-alt"></i> Toplam Deneme <b>{totalExams}</b></div>
              <div className="ticker-dot"></div>
              <div className="ticker-item"><i className="fas fa-chart-line"></i> Ortalama Puan <b>{avgScore}</b></div>
              <div className="ticker-dot"></div>
              <div className="ticker-item"><i className="fas fa-trophy"></i> En Yüksek Puan <b>{bestScore}</b></div>
              <div className="ticker-dot"></div>
              {/* Seamless loop duplication */}
              <div className="ticker-item"><i className="fas fa-users"></i> Öğrenci Sayısı <b>{students.length}</b></div>
              <div className="ticker-dot"></div>
              <div className="ticker-item"><i className="fas fa-file-alt"></i> Toplam Deneme <b>{totalExams}</b></div>
              <div className="ticker-dot"></div>
              <div className="ticker-item"><i className="fas fa-chart-line"></i> Ortalama Puan <b>{avgScore}</b></div>
              <div className="ticker-dot"></div>
              <div className="ticker-item"><i className="fas fa-trophy"></i> En Yüksek Puan <b>{bestScore}</b></div>
              <div className="ticker-dot"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

