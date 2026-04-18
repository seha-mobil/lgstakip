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
      {/* Premium Hero Section */}
      <div className="flex-mobile-col" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '40px', marginBottom: '64px', marginTop: '20px' }}>
        <div style={{ flex: 1, maxWidth: '650px' }}>
          {/* Animated Badge */}
          <div className="animate-fade-up" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            background: 'rgba(124, 58, 237, 0.1)', 
            border: '1px solid rgba(124, 58, 237, 0.2)', 
            borderRadius: '100px',
            marginBottom: '24px'
          }}>
            <div style={{ width: '6px', height: '6px', background: '#a78bfa', borderRadius: '50%', boxShadow: '0 0 10px #a78bfa' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>Öğrenci, veli ve koç için tek panel</span>
          </div>

          <h1 className="animate-fade-up" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px', animationDelay: '0.1s' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(232, 184, 75, 0.3))'
            }}>Başarıya</span> giden yolu<br />adım adım takip et.
          </h1>
          
          <p className="animate-fade-up" style={{ fontSize: '18px', color: 'var(--text2)', lineHeight: 1.6, maxWidth: '500px', animationDelay: '0.2s' }}>
            Günlük görevler, deneme analitiği, koç notları ve ilerleme grafikleri tek bir uygulamada.
          </p>
        </div>

        <div className="animate-fade-up" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.3s' }}>
          <CountdownCard targetDate="2026-06-13T09:30:00" title="LGS 2026" />
          <CountdownCard targetDate="2027-06-11T09:30:00" title="LGS 2027" />
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
          <div className="sec-title" style={{ marginBottom: '24px', opacity: 0.6, fontSize: '11px', letterSpacing: '3px' }}>ÖĞRENCİLER</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {students.map((s, i) => {
              const lastExam = s.examResults[s.examResults.length - 1];
              const prevExam = s.examResults.length > 1 ? s.examResults[s.examResults.length - 2] : null;
              const trend = lastExam && prevExam ? lastExam.lgsPuani - prevExam.lgsPuani : 0;
              
              return (
                <Link href={"/student/" + s.id} key={s.id} className="glass-card animate-fade-up" style={{ 
                  padding: '32px', 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '20px',
                  background: 'rgba(10, 13, 20, 0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  animationDelay: (0.4 + i * 0.1) + "s" 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 800 }}>
                      <div style={{ background: s.color, width: '12px', height: '12px', borderRadius: '50%', boxShadow: `0 0 10px ${s.color}60` }}></div>
                      {s.name}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600 }}>{s.examResults.length} deneme</span>
                  </div>
                  
                  {lastExam ? (
                    <>
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ 
                          fontSize: '52px', 
                          fontWeight: 900, 
                          letterSpacing: '-2px', 
                          color: '#fff',
                          textShadow: '0 0 20px rgba(255,255,255,0.1)'
                        }}>
                          {lastExam.lgsPuani.toFixed(2).replace('.', ',')}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Son Deneme Puanı</div>
                      </div>
                      
                      <div style={{ 
                        marginTop: 'auto',
                        paddingTop: '20px', 
                        borderTop: '1px solid rgba(255,255,255,0.05)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        fontSize: '14px' 
                      }}>
                        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>Son Net <b style={{ color: '#fff', marginLeft: '6px' }}>{lastExam.toplamNet.toString().replace('.', ',')}</b></span>
                        {trend !== 0 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            color: trend > 0 ? 'var(--green)' : 'var(--red)',
                            fontWeight: 800,
                            fontSize: '13px',
                            background: trend > 0 ? 'rgba(61, 214, 140, 0.1)' : 'rgba(240, 90, 90, 0.1)',
                            padding: '4px 10px',
                            borderRadius: '8px'
                          }}>
                            <i className={`fas fa-caret-${trend > 0 ? 'up' : 'down'}`}></i>
                            {Math.abs(trend).toFixed(1).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4 }}>
                      <i className="fas fa-file-circle-plus" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Henüz deneme kaydı yok</span>
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

