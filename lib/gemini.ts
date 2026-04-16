// Direct REST API call to Gemini - bypasses SDK v1beta issue entirely
export async function generateAnalysis(studentData: any, examsData: any[]) {
  const API_KEY = process.env.GEMINI_API_KEY || "";
  
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

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
      Ders Bazlı Netler: ${ex.subjects.map((s: any) => `${s.subjectKey}: ${(s.dogru - (s.yanlis / 3)).toFixed(2)}`).join(", ")}
      Öğrenci Notu: ${ex.notes || "Not bırakılmamış"}
    `).join("\n")}
    
    Analiz Kuralları:
    1. İlerleme durumunu (artış/azalış) değerlendir.
    2. Öğrencinin sınav notlarına (örn: "süre yetmedi", "dikkat hatası") özellikle odaklan ve çözüm öner.
    3. Hedef puana olan "gerçek" mesafeyi yorumla (450+ puanların zorluk derecesinin çok yüksek olduğunu unutma).
    4. Cevabı Markdown formatında, başlıklar ve listeler kullanarak ver.
    5. Dil: Türkçe. Samimi ama profesyonel bir üslup kullan.
  `;

  // Try multiple API versions and model names via direct REST
  const attempts = [
    { version: "v1", model: "gemini-2.0-flash" },
    { version: "v1", model: "gemini-1.5-flash" },
    { version: "v1beta", model: "gemini-2.0-flash" },
    { version: "v1", model: "gemini-pro" },
    { version: "v1beta", model: "gemini-pro" },
  ];

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  let lastError = null;

  for (const attempt of attempts) {
    const url = `https://generativelanguage.googleapis.com/${attempt.version}/models/${attempt.model}:generateContent?key=${API_KEY}`;
    
    try {
      console.log(`[AI Analysis] Trying ${attempt.version}/${attempt.model}...`);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[AI Analysis] ${attempt.version}/${attempt.model} -> ${res.status}: ${errBody.substring(0, 200)}`);
        lastError = new Error(`${res.status}: ${errBody.substring(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        console.log(`[AI Analysis] SUCCESS with ${attempt.version}/${attempt.model}`);
        return text;
      }
    } catch (err: any) {
      console.error(`[AI Analysis] ${attempt.version}/${attempt.model} fetch error:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Hiçbir AI modeli yanıt veremedi. Lütfen API anahtarınızı kontrol edin.");
}
