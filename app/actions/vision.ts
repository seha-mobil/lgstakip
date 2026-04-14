'use server';

export async function scanImageAction(base64Image: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { 
      success: false, 
      error: 'GEMINI_API_KEY bulunamadı. Lütfen .env dosyasına ekleyin.' 
    };
  }

  const prompt = `
    Bu bir öğrenci LGS deneme sonuç belgesidir. 
    Önemli Kurallar:
    1. LGS'de 3 yanlış 1 doğruyu götürür. Görselde 'Net' yazıyorsa doğrudan onu oku. 
       Yazmıyorsa Doğru ve Yanlış sayılarından (Doğru - Yanlış/3) şeklinde hesapla.
    2. Sonuçları sadece aşağıdaki JSON formatında döndür:
    
    {
      "examName": "Sınavın tam adı",
      "puan": 450.123,
      "subjects": [
        { "name": "TURKCE", "dogru": 18, "yanlis": 2, "net": 17.33 },
        { "name": "MATEMATIK", "dogru": 19, "yanlis": 1, "net": 18.67 },
        { "name": "FEN", "dogru": 19, "yanlis": 1, "net": 18.67 },
        { "name": "INKILAP", "dogru": 10, "yanlis": 0, "net": 10.00 },
        { "name": "DINKULTUR", "dogru": 10, "yanlis": 0, "net": 10.00 },
        { "name": "INGILIZCE", "dogru": 10, "yanlis": 0, "net": 10.00 }
      ]
    }

    Not: Ders isimlerini mutlaka yukarıdaki anahtarlardan (TURKCE, MATEMATIK, FEN, INKILAP, DINKULTUR, INGILIZCE) biriyle eşleştirerek döndür.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image.split(',')[1] || base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for more structured output
          }
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API Hatası');
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Yapay zeka yanıt üretemedi.');
    }

    // JSON modunu manuel olarak temizle (Markdown taglerini kaldır)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const result = JSON.parse(text);
    return { success: true, data: result };

  } catch (error: any) {
    console.error('Vision AI Error:', error);
    return { success: false, error: error.message || 'Beklenmedik bir hata oluştu.' };
  }
}
