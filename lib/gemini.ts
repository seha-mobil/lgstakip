import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateAnalysis(studentData: any, examsData: any[]) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Sen bir LGS (Liselere Geçiş Sistemi) eğitim koçusun. Aşağıdaki öğrenci verilerini analiz et ve öğrenciye özel, motive edici ve aksiyon odaklı bir rapor hazırla.
    
    Öğrenci Bilgileri:
    - Ad: ${studentData.name}
    - Hedef Lise: ${studentData.targetLiseName || "Belirtilmedi"}
    - Hedef Puan: ${studentData.targetLisePuan || "Belirtilmedi"}
    
    Sınav Geçmişi (Son Sınavlar):
    ${examsData.map((ex, i) => `
      ${i + 1}. Sınav (${new Date(ex.date).toLocaleDateString()}): 
      Puan: ${ex.lgsPuani}, Toplam Net: ${ex.toplamNet}
      Ders Bazlı Netler: ${ex.subjects.map((s: any) => `${s.subjectKey}: ${s.dogru - (s.yanlis / 3)}`).join(", ")}
      Öğrenci Notu: ${ex.notes || "Not bırakılmamış"}
    `).join("\n")}
    
    Analiz Kuralları:
    1. İlerleme durumunu (artış/azalış) değerlendir.
    2. Öğrencinin sınav notlarına (örn: "süre yetmedi", "dikkat hatası") özellikle odaklan ve çözüm öner.
    3. Hedef puana olan "gerçek" mesafeyi yorumla (450+ puanların zorluk derecesinin çok yüksek olduğunu unutma).
    4. Cevabı Markdown formatında, başlıklar ve listeler kullanarak ver.
    5. Dil: Türkçe. Samimi ama profesyonel bir üslup kullan.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
