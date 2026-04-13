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

  let rows = '';
  student.examResults.forEach(ex => {
    rows += "<tr>" +
        "<td>" + new Date(ex.date).toLocaleDateString('tr-TR') + "</td>" +
        "<td>" + ex.trialExam.name + "</td>" +
        "<td>" + ex.toplamNet + "</td>" +
        "<td>" + ex.lgsPuani.toFixed(2) + "</td>" +
      "</tr>";
  });

  const html = '<!DOCTYPE html>' +
  '<html lang="tr">' +
  '<head>' +
    '<meta charset="UTF-8">' +
    '<title>' + student.name + ' - LGS Takip Çizelgesi</title>' +
    '<style>' +
      'body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #000; }' +
      'h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }' +
      'p { text-align: center; margin-bottom: 30px; font-size: 14px; color: #555; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 20px; }' +
      'th, td { border: 1px solid #000; padding: 12px; text-align: left; }' +
      'th { background-color: #f4f4f4; }' +
      '.footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ccc; padding-top: 10px; }' +
      '@media print { body { padding: 0; } }' +
    '</style>' +
  '</head>' +
  '<body onload="window.print();">' +
    '<h1>' + student.name + ' LGS Deneme Takip Çizelgesi</h1>' +
    '<p>Toplam Deneme Kaydı: <strong>' + student.examResults.length + '</strong> | Çıktı Tarihi: ' + new Date().toLocaleDateString("tr-TR") + '</p>' +
    '<table>' +
      '<thead>' +
        '<tr>' +
          '<th>Tarih</th>' +
          '<th>Deneme Adı</th>' +
          '<th>Toplam Net</th>' +
          '<th>LGS Puanı</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        rows +
      '</tbody>' +
    '</table>' +
    '<div class="footer">E-LGS Takip Sistemi tarafından otomatik olarak oluşturulmuştur.</div>' +
  '</body>' +
  '</html>';

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
