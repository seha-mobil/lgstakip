import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAnalysis(studentData: any, examsData: any[]) {
  const API_KEY = process.env.GEMINI_API_KEY || "";
  
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Try these models in order until one works
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
  ];

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

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI Analysis] Attempting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`[AI Analysis] Success with model: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      console.error(`[AI Analysis] Failed with model: ${modelName}. Error:`, err.message || err);
      lastError = err;
      // Continue to next model
    }
  }

  // If we reach here, all models failed
  throw lastError || new Error("All AI models failed to generate content.");
}
