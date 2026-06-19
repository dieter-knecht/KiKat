import { dbService } from './db';
import { decryptData } from './crypto';

export async function sendGeminiQuery(category, inputValues) {
  const encryptedKey = await dbService.getSetting('gemini_api_key');
  if (!encryptedKey) {
    throw new Error('API_KEY_MISSING');
  }
  const apiKey = await decryptData(encryptedKey);
  if (!apiKey) {
    throw new Error('API_KEY_INVALID');
  }

  let model = await dbService.getSetting('gemini_model', 'gemini-3.1-flash-lite-preview');
  if (model === 'gemini-1.5-pro') {
    model = 'gemini-1.5-pro-latest';
  }
  if (model === 'gemini-1.5-flash') {
    model = 'gemini-1.5-flash-latest';
  }

  let prompt = category.template || '';
  const inlineImages = [];

  for (const field of category.fields) {
    const value = inputValues[field.name];
    if (field.type === 'file') {
      if (value && typeof value === 'string' && value.startsWith('data:')) {
        const matches = value.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          inlineImages.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
      prompt = prompt.replace(new RegExp(`{${field.name}}`, 'g'), '[Beigefügte Datei]');
    } else {
      const textVal = value || '';
      prompt = prompt.replace(new RegExp(`{${field.name}}`, 'g'), textVal);
    }
  }

  const sectionsList = category.outputSections || [];
  const sectionsString = sectionsList.map((s, idx) => `${idx + 1}. ${s}`).join('\n');

  const systemPrompt = `Du bist ein hilfreicher KI-Assistent. Der Anwender hat folgendes Prompt-Template ausgeführt. 
Bitte erstelle eine strukturierte Antwort, die genau den folgenden gewünschten Abschnitten entspricht. 
Jeder Abschnitt soll detailliert und formatiert (in Markdown) beantwortet werden.

Gewünschte Abschnitte:
${sectionsString}

Antworte **ausschließlich** im JSON-Format. Die JSON-Ausgabe muss exakt dieses Schema haben:
{
  "suggestedTitle": "Generiere hier einen passenden Titel (z.B. für Bilder: Kurze Beschreibung des Inhalts. Für Dokumente: Dokumentenart + Absender. Max 60 Zeichen).",
  "sections": [
    { "title": "Abschnittsname", "content": "Detaillierter Markdown-Inhalt" }
  ]
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: `${systemPrompt}\n\nBenutzer-Prompt:\n${prompt}` },
          ...inlineImages
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const status = res.status;
    if (status === 400 && errData.error?.message?.toLowerCase().includes('api key')) {
      throw new Error('API_KEY_INVALID');
    }
    if (status === 403 || status === 400) {
      throw new Error('API_KEY_INVALID');
    }
    if (status === 429) {
      throw new Error('API_LIMIT_REACHED');
    }
    throw new Error(errData.error?.message || `Netzwerkfehler: Status ${status}`);
  }

  const data = await res.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('EMPTY_RESPONSE');
  }

  try {
    let cleanText = textResponse.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    const parsed = JSON.parse(cleanText.trim());
    return { 
      sections: parsed.sections || [], 
      suggestedTitle: parsed.suggestedTitle || '' 
    };
  } catch (err) {
    console.error('Failed to parse JSON response', err);
    return { 
      sections: [{ title: 'Antwort', content: textResponse }], 
      suggestedTitle: '' 
    };
  }
}
