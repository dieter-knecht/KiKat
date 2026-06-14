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

  const model = await dbService.getSetting('gemini_model', 'gemini-1.5-flash');

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
      prompt = prompt.replace(new RegExp(`{${field.name}}`, 'g'), '[Beigefügtes Bild]');
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

Antworte im vorgegebenen JSON-Format mit einem 'sections' Array.`;

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
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          sections: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                content: { type: 'STRING', description: 'Detailed markdown content for the section' }
              },
              required: ['title', 'content']
            }
          }
        },
        required: ['sections']
      }
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
    const parsed = JSON.parse(textResponse);
    return parsed.sections || [];
  } catch (err) {
    console.error('Failed to parse JSON response', err);
    return [{ title: 'Antwort', content: textResponse }];
  }
}
