// Direct REST API call to Gemini 2.0 Flash
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

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  // gemini-2.0-flash is the correct and available model
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
  console.log(`[AI Analysis] Calling gemini-2.0-flash via v1 API...`);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[AI Analysis] Error ${res.status}:`, errBody.substring(0, 300));
    
    if (res.status === 429) {
      throw new Error("Günlük AI analiz kotası doldu. Lütfen yarın tekrar deneyin veya Google AI Studio'dan kotanızı yükseltin.");
    }
    
    throw new Error(`AI analiz hatası (${res.status}). Lütfen daha sonra tekrar deneyin.`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("AI'dan boş yanıt geldi. Lütfen tekrar deneyin.");
  }

  console.log(`[AI Analysis] Success! Response received.`);
  return text;
}
