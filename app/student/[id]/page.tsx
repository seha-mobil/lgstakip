import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Import V2 Styles
import '@/app/globals-v2.css';

// Import V2 Components
import { V2Header, V2StatCard } from '@/components/v2/V2DashboardBasics';
import { V2AICoachSidebar } from '@/components/v2/V2AICoachSidebar';
import { V2MainDashboard } from '@/components/v2/V2MainDashboard';
import { V2RadialProgress } from '@/components/v2/V2RadialProgress';

export default async function StudentDetail({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const auth = cookieStore.get(`student_auth_${params.id}`);
  if (!auth) redirect(`/student/${params.id}/login`);

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      examResults: {
        include: { subjects: true, trialExam: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!student) return <div className="v2-dashboard">Öğrenci bulunamadı.</div>;

  const exams = student.examResults;
  const lastExam = exams.length ? exams[exams.length - 1] : null;
  const avgScore = exams.length ? exams.reduce((acc: any, ex: any) => acc + ex.lgsPuani, 0) / exams.length : 0;
  
  // v2 Estimated Data
  const netIncrease = 8; // Estimated weekly growth
  const riskScore = avgScore > 450 ? 12 : avgScore > 400 ? 38 : 65;
  const dailyGoals = [
    { text: "Matematik: 20 soru çöz", completed: true },
    { text: "Fen Bilimleri: 30 dk çalışma", completed: true },
    { text: "Paragraf testi çöz", completed: false },
    { text: "Bugün Konu Testi Çöz", completed: false },
  ];

  return (
    <div className="v2-dashboard animate-fade-up">
      <V2Header studentName={student.name} netIncrease={netIncrease} />
      
      <div className="v2-stat-grid">
        <V2StatCard 
          title="Güncel Net" 
          value={`+${netIncrease} Net`} 
          subValue={`Toplam ${(exams.length ? exams[exams.length-1].toplamNet : 0).toFixed(2)}`}
          trend="Bu Hafta"
          type="green"
        />
        <V2StatCard 
          title="Hedef Puan" 
          value={`${student.targetLisePuan || '---'} Puan`}
          subValue={student.targetLiseName || 'Hedef Yok'}
          type="gold"
        />
        <V2StatCard 
          title="Bu Ay Gelişim" 
          value="+24 Net" 
          subValue="239 Toplam Soru"
          type="blue"
        />
        <V2StatCard 
          title="Risk Skoru" 
          value={riskScore.toString()} 
          trend={riskScore < 30 ? "Düşük" : "Orta"}
          type={riskScore < 30 ? "green" : "blue"}
        />
      </div>

      <div className="v2-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <V2MainDashboard exams={exams} studentColor={student.color} />
          
          <div style={{ display: 'flex', gap: '20px' }}>
             <V2RadialProgress label="Matematik" percentage={87} color="var(--v2-emerald)" />
             <V2RadialProgress label="Türkçe" percentage={81} color={student.color} />
          </div>
          
          <div className="v2-glass-card" style={{ padding: '24px' }}>
             <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Günlük Hedefler</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dailyGoals.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={`fas ${g.completed ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: g.completed ? 'var(--v2-emerald)' : 'var(--v2-text-dark)' }}></i>
                    <span style={{ fontSize: '14px', color: g.completed ? 'var(--v2-text-dim)' : 'white' }}>{g.text}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column */}
        <V2AICoachSidebar studentName={student.name} goals={dailyGoals} riskScore={riskScore} />
      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: 'var(--v2-text-dark)', opacity: 0.6 }}>
        © 2026 LGS Takip • Premium Dashboard v2
      </footer>
    </div>
  );
}
