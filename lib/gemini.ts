// AI Analysis - Groq (primary) with Gemini fallback

export async function generateAnalysis(studentData: any, examsData: any[]) {
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
4. Cevabı başlıklar ve listeler kullanarak ver.
5. Dil: Türkçe. Samimi ama profesyonel bir üslup kullan.
`;

  // Try Groq first (faster, more generous quota)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log("[AI Analysis] Trying Groq (llama-3.3-70b-versatile)...");
      const result = await callGroq(groqKey, prompt);
      if (result) {
        console.log("[AI Analysis] Groq success!");
        return result;
      }
    } catch (err: any) {
      console.error("[AI Analysis] Groq failed:", err.message);
    }
  }

  // Fallback to Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log("[AI Analysis] Trying Gemini (gemini-2.0-flash)...");
      const result = await callGemini(geminiKey, prompt);
      if (result) {
        console.log("[AI Analysis] Gemini success!");
        return result;
      }
    } catch (err: any) {
      console.error("[AI Analysis] Gemini failed:", err.message);
      if (err.message.includes("429") || err.message.includes("quota")) {
        throw new Error("AI analiz kotası doldu. Lütfen daha sonra tekrar deneyin.");
      }
    }
  }

  if (!groqKey && !geminiKey) {
    throw new Error("AI analizi için GROQ_API_KEY veya GEMINI_API_KEY gereklidir. Lütfen .env dosyanızı kontrol edin.");
  }

  throw new Error("AI analizi şu anda kullanılamıyor. Lütfen daha sonra deneyin.");
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Groq ${res.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini ${res.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
