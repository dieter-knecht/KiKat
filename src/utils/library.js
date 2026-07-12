const MOCK_STORAGE_KEY = 'kikat_central_library';

// Default categories version seed data for local sandbox simulation
const SEED_LIBRARY_DATA = [
  {
    libraryKey: 'song-analyse',
    name: 'Song-Analyse',
    description: 'Analyse von Liedern, Genres und textlichen/musikalischen Besonderheiten.',
    latestVersion: '1.1.6',
    createdAt: '2026-06-14 10:00:00',
    updatedAt: '2026-06-24 15:30:00',
    versions: [
      {
        version: '1.0.0',
        description: 'Analyse von Liedern, Genres und textlichen/musikalischen Besonderheiten.',
        date: '2026-06-14 10:00:00',
        changelog: 'Initiale Version der Song-Analyse.',
        fields: [
          { name: 'interpret', label: 'Interpret', type: 'text', required: false },
          { name: 'titel', label: 'Song-Titel', type: 'text', required: false }
        ],
        template: "Erstelle einen strukturierten Bericht zum Song '{titel}' von '{interpret}'.\n\nDer Bericht soll folgende Abschnitte enthalten:\n1. Erscheinungsjahr\n2. Einordnung in Musikstil / Genre\n3. Musikalische Besonderheiten",
        outputSections: ['Erscheinungsjahr', 'Einordnung in Musikstil / Genre', 'Musikalische Besonderheiten']
      },
      {
        version: '1.1.6',
        description: 'Analyse von Liedern, Genres und textlichen/musikalischen Besonderheiten.',
        date: '2026-06-24 15:30:00',
        changelog: 'Behebung eines Logikfehlers: Wenn die Textpassage gefüllt ist, sucht die KI nun explizit nach dem Song und gibt "Gefundener Song & Interpret" zurück.',
        fields: [
          { name: 'interpret', label: 'Interpret', type: 'text', required: false },
          { name: 'titel', label: 'Song-Titel', type: 'text', required: false },
          { name: 'passage', label: 'Optionale Textpassage', type: 'textarea', required: false }
        ],
        template: "Erstelle einen strukturierten Bericht zum Song '{titel}' von '{interpret}'. Die folgende Textpassage wurde vom Nutzer bereitgestellt: {passage}\n\nDer Bericht soll folgende Abschnitte enthalten:\n1. Erscheinungsjahr\n2. Einordnung in Musikstil / Genre\n3. Musikalische Besonderheiten",
        outputSections: ['Erscheinungsjahr', 'Einordnung in Musikstil / Genre', 'Musikalische Besonderheiten']
      }
    ]
  },
  {
    libraryKey: 'bild-analyse',
    name: 'Bild-Analyse',
    description: 'Detaillierte Analyse eines Bildes per Vision-API.',
    latestVersion: '1.0.0',
    createdAt: '2026-06-14 10:15:00',
    updatedAt: '2026-06-14 10:15:00',
    versions: [
      {
        version: '1.0.0',
        description: 'Detaillierte Analyse eines Bildes per Vision-API.',
        date: '2026-06-14 10:15:00',
        changelog: 'Initiale Version der Bild-Analyse mit Vision API.',
        fields: [
          { name: 'bild', label: 'Bilddatei (JPG, PNG, WEBP)', type: 'file', required: true }
        ],
        template: 'Analysiere das beigefügte Bild und erstelle einen strukturierten Bericht mit folgenden Abschnitten:\n1. Technische Details\n2. Bildkategorie\n3. Detaillierte Bildbeschreibung\n4. Bewertung der Bildkomposition\n5. Einschätzung: reales Foto oder KI-generiertes Bild (mit Begründung)',
        outputSections: [
          'Technische Details (Auflösung, Format, Belichtung falls erkennbar)',
          'Bildkategorie (Portrait, Landschaft, Architektur, etc.)',
          'Detaillierte Bildbeschreibung',
          'Bewertung der Bildkomposition',
          'Einschätzung: reales Foto oder KI-generiertes Bild (mit Begründung)'
        ]
      }
    ]
  },
  {
    libraryKey: 'dokumentenverarbeitung',
    name: 'Dokumentenverarbeitung',
    description: 'Extrahierung strukturierter JSON-Daten aus Schweizer Rechnungen und Belegen.',
    latestVersion: '1.0.0',
    createdAt: '2026-06-14 10:30:00',
    updatedAt: '2026-06-14 10:30:00',
    versions: [
      {
        version: '1.0.0',
        description: 'Extrahierung strukturierter JSON-Daten aus Schweizer Rechnungen und Belegen.',
        date: '2026-06-14 10:30:00',
        changelog: 'Initiale Version zur automatisierten Beleg-Extrahierung (JSON). Ignoriert Detail-Recyclinggebühren und zieht globale vRB-Werte ab.',
        fields: [
          { name: 'dokument', label: 'Beleg (PDF/Bild)', type: 'file', required: true }
        ],
        template: `Du bist ein System zur automatisierten Dokumentenverarbeitung für Schweizer Belege. Deine Aufgabe ist es, Daten aus dem bereitgestellten Dokument strukturiert als JSON zu extrahieren.

WICHTIGE EXTRAKTIONS-REGELN:

AUSSCHLUSS (Recyclinggebühr oder zusätzliche angaben auf Artikelebene):
- Ignoriere Detailzeilen innerhalb der Artikeltabelle, die den Text "Recyclinggebühr" oder "vRG" direkt beim Produkt enthalten.
- Der Betrag dieser eingebetteten Recyclinggebühr darf NICHT als eigene Position extrahiert und NICHT in die Berechnung des Artikel-Einzelpreises einbezogen werden.

EXTRAKTION (vRB / globale Gebühren, Fracht, Spesen unterhalb der Tabelle):
- Suche unterhalb der Artikeltabelle im Bereich der Gesamtsummen explizit nach dem Feld "vRB" (vorgezogene Recyclinggebühr) oder "vRG".
- Extrahiere diesen Wert zwingend als globales Rechnungsfeld.

Erwartetes Ausgabeformat (JSON):

Antworte ausschließlich mit einem validen JSON-Objekt in folgender Struktur:
{
  "rechnungs_informationen": {
    "beleg_nummer": "String",
    "datum": "String"
  },
  "positionen": [
    {
      "artikel_nr": "String",
      "bezeichnung": "Hauptbezeichnung des Artikels (Texte wie 'Recyclinggebühr' hier komplett ignorieren)",
      "menge": 1,
      "preis_exkl_mwst": 0.0,
      "total_exkl_mwst": 0.0
    }
  ],
  "gesamtsummen": {
    "zwischensumme_exkl_mwst": 0.0,
    "skonto": 0.0,
    "vrb": 0.0,
    "Spesen": 0.0,
    "mwst_betrag": 0.0,
    "total_inkl_mwst": 0.0
  }
}

Aufgabe:

Verarbeite das Dokument und liefere ausschließlich das JSON-Objekt zurück. Keine Erklärungen, kein Markdown-Inhalt außerhalb des JSON-Blocks.`,
        outputSections: ['Extrahierte JSON-Daten']
      }
    ]
  }
];

// Helper to seed localStorage library
function initMockLibrary() {
  if (!localStorage.getItem(MOCK_STORAGE_KEY)) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(SEED_LIBRARY_DATA));
  }
}

export const libraryService = {
  /**
   * Fetches the central library categories
   * @param {string} apiUrl Optional Central API URL. If empty, falls back to localStorage simulation.
   */
  async getCategories(apiUrl) {
    if (apiUrl && apiUrl.trim() !== '') {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error('Failed to fetch from Central Library API:', err);
        throw new Error(err.message || 'API unreachable', { cause: err });
      }
    } else {
      // Sandbox simulation mode
      initMockLibrary();
      const localData = localStorage.getItem(MOCK_STORAGE_KEY);
      return JSON.parse(localData || '[]');
    }
  },

  /**
   * Publishes a category version to the central library
   * @param {string} apiUrl Optional Central API URL. If empty, falls back to localStorage simulation.
   * @param {object} categoryData The category data to publish
   */
  async publishCategory(apiUrl, categoryData) {
    if (apiUrl && apiUrl.trim() !== '') {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
          const errMsg = await response.json().catch(() => ({}));
          throw new Error(errMsg.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error('Failed to publish to Central Library API:', err);
        throw new Error(err.message || 'API unreachable', { cause: err });
      }
    } else {
      // Sandbox simulation mode
      initMockLibrary();
      const mockDb = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || '[]');
      
      const name = categoryData.name;
      const version = categoryData.version;
      const libraryKey = categoryData.libraryKey || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      
      let catIndex = mockDb.findIndex(cat => cat.libraryKey === libraryKey);
      
      const newVersion = {
        version: version,
        description: categoryData.description || '',
        fields: categoryData.fields || [],
        template: categoryData.template || '',
        outputSections: categoryData.outputSections || [],
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        changelog: categoryData.changelog || ''
      };

      if (catIndex !== -1) {
        mockDb[catIndex].name = name;
        mockDb[catIndex].description = categoryData.description || mockDb[catIndex].description;
        mockDb[catIndex].latestVersion = version;
        mockDb[catIndex].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        if (!Array.isArray(mockDb[catIndex].versions)) {
          mockDb[catIndex].versions = [];
        }
        
        // Overwrite if version exists, otherwise push
        const vIdx = mockDb[catIndex].versions.findIndex(v => v.version === version);
        if (vIdx !== -1) {
          mockDb[catIndex].versions[vIdx] = newVersion;
        } else {
          mockDb[catIndex].versions.push(newVersion);
        }
      } else {
        mockDb.push({
          libraryKey: libraryKey,
          name: name,
          description: categoryData.description || '',
          latestVersion: version,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          versions: [newVersion]
        });
      }
      
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockDb));
      return { success: true, message: 'Category published successfully (simulated)' };
    }
  }
};
