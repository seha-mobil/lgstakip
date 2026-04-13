import { getStudents } from '@/app/actions';

export default async function ComparePage() {
  const allStudents = await getStudents();
  const studentsWithExams = allStudents.filter(s => s.examResults.length > 0);

  if (studentsWithExams.length < 2) {
    return (
      <div className="page animate-fade-up">
        <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '24px' }}>Karşılaştırma</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div className="animate-float" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--text3)', marginBottom: '18px' }}>
            <i className="fas fa-chart-bar"></i>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text2)', marginBottom: '6px' }}>Yeterli veri yok</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)' }}>En az 2 öğrenciye ait deneme kaydı gereklidir.</div>
        </div>
      </div>
    );
  }

  // Calculate averages per student
  const stats = studentsWithExams.map(s => {
    const avgNet = s.examResults.reduce((a, e) => a + e.toplamNet, 0) / s.examResults.length;
    const avgLgs = s.examResults.reduce((a, e) => a + e.lgsPuani, 0) / s.examResults.length;
    return { ...s, avgNet: Math.round(avgNet * 100) / 100, avgLgs: Math.round(avgLgs * 100) / 100 };
  }).sort((a,b) => b.avgNet - a.avgNet);

  return (
    <div className="page animate-fade-up">
      <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '24px' }}>Karşılaştırma Sıralaması</h2>
      
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="sec-title">Toplam Ortalama Net</div>
        {stats.map((item, i) => {
          const p = (item.avgNet / 90) * 100;
          const isBest = i === 0;
          return (
            <div key={item.id} style={{ marginBottom: '16px', animationDelay: (i * 0.05) + "s" }} className="animate-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: item.color, width: '10px', height: '10px', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.name}</span>
                  {isBest && <span style={{ fontSize: '9px', background: 'rgba(61,214,140,0.15)', color: 'var(--green)', padding: '2px 7px', borderRadius: '20px', fontWeight: 700, fontFamily: 'var(--mono)' }}>EN İYİ</span>}
                </div>
                <span style={{ fontWeight: 800, fontFamily: 'var(--mono)', color: item.color }}>{item.avgNet}</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: Math.min(100, p) + '%', background: item.color + (isBest ? 'cc' : '77') }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
