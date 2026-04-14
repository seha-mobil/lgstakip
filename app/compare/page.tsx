import { getStudents } from '@/app/actions';
import CompareClient from './CompareClient';

export const dynamic = 'force-dynamic';

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

  return (
    <div className="page animate-fade-up">
      <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '24px' }}>Karşılaştırma Sıralaması</h2>
      <CompareClient students={studentsWithExams} />
    </div>
  );
}
