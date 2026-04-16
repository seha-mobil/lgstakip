import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      examResults: {
        include: { trialExam: true, subjects: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!student) return new Response('Öğrenci bulunamadı', { status: 404 });

  const avgPuan = student.examResults.length > 0
    ? student.examResults.reduce((acc, curr) => acc + curr.lgsPuani, 0) / student.examResults.length
    : 0;

  const targetPuan = student.targetLisePuan || 0;
  const progressPercent = targetPuan > 0 ? Math.min(100, (Math.pow(avgPuan / targetPuan, 1.5) * 100)) : 0;

  const html = `<!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="UTF-8">
    <title>${student.name} - Gelişim Raporu</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
      body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #0f172a; }
      .student-info { display: flex; gap: 40px; margin-bottom: 40px; background: #f8fafc; padding: 25px; borderRadius: 15px; border: 1px solid #e2e8f0; }
      .info-item { display: flex; flexDirection: column; }
      .info-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
      .info-value { font-size: 18px; font-weight: 700; color: #1e293b; }
      
      .target-section { margin-bottom: 40px; }
      .progress-container { height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin: 10px 0; }
      .progress-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); width: ${progressPercent}%; border-radius: 6px; }
      
      table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      th, td { padding: 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      th { background-color: #f1f5f9; font-weight: 700; color: #475569; font-size: 13px; text-transform: uppercase; }
      tr:last-child td { border-bottom: none; }
      .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #166534; }
      @media print { body { padding: 0; } .header { border-bottom-color: #000; } }
    </style>
  </head>
  <body onload="window.print();">
    <div class="header">
      <div>
        <h1>Akademik Gelişim Raporu</h1>
        <div style="color: #64748b; font-weight: 600; margin-top: 4px;">LGS Hazırlık Süreci Takip Sistemi</div>
      </div>
      <div style="text-align: right">
        <div style="font-weight: 700; color: #3b82f6;">${new Date().toLocaleDateString("tr-TR")}</div>
        <div style="font-size: 12px; color: #94a3b8;">Rapor No: #${Math.floor(Math.random() * 90000) + 10000}</div>
      </div>
    </div>

    <div class="student-info">
      <div class="info-item">
        <span class="info-label">Öğrenci</span>
        <span class="info-value">${student.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Sınav Sayısı</span>
        <span class="info-value">${student.examResults.length} Deneme</span>
      </div>
      <div class="info-item">
        <span class="info-label">Puan Ortalaması</span>
        <span class="info-value">${avgPuan.toFixed(2)}</span>
      </div>
    </div>

    ${targetPuan > 0 ? `
    <div class="target-section">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
        <span style="font-weight: 700; font-size: 14px;">Hedef: ${student.targetLiseName}</span>
        <span style="font-size: 13px; color: #64748b;">Gelişim: %${progressPercent.toFixed(1)}</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar"></div>
      </div>
    </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Deneme Adı</th>
          <th>Net</th>
          <th>Puan</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        ${student.examResults.map(ex => `
          <tr>
            <td>${new Date(ex.date).toLocaleDateString('tr-TR')}</td>
            <td style="font-weight: 600;">${ex.trialExam.name}</td>
            <td style="font-family: monospace; font-weight: 600;">${ex.toplamNet.toFixed(2)}</td>
            <td style="font-weight: 700; color: #3b82f6;">${ex.lgsPuani.toFixed(2)}</td>
            <td><span class="badge">Tamamlandı</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      Bu rapor e-LGS Takip Sistemi tarafından <strong>${student.name}</strong> için özel olarak oluşturulmuştur.<br>
      Başarıların devamını dileriz.
    </div>
  </body>
  </html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
