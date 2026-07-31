import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { version as appVersion } from '../package.json';
import { dbService } from './utils/db';
import { encryptData, decryptData } from './utils/crypto';
import { sendGeminiQuery } from './utils/gemini';
import { exportToPDF } from './utils/pdf';
import { libraryService } from './utils/library';
import {
  FileText,
  History,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Download,
  Copy,
  Edit3,
  Sun,
  Moon,
  ChevronRight,
  Upload,
  AlertCircle,
  Menu,
  X,
  Languages,
  Save,
  Check,
  BookOpen,
  CloudDownload,
  UploadCloud,
  RefreshCw
} from 'lucide-react';

const TRANSLATIONS = {
  de: {
    appName: 'KiKat',
    navQuery: 'Abfrage durchführen',
    navHistory: 'Verlauf',
    navManage: 'Kategorien verwalten',
    navSettings: 'Einstellungen',
    apiSettings: 'Gemini API-Konfiguration',
    apiKeyLabel: 'Gemini API-Schlüssel',
    apiModelLabel: 'Gemini-Modell',
    pdfPathLabel: 'Standard-Exportordner für PDFs (Windows)',
    languageLabel: 'Sprache',
    themeLabel: 'Design',
    saveBtn: 'Speichern',
    savedMsg: 'Erfolgreich gespeichert!',
    reqFieldErr: 'Dieses Feld ist ein Pflichtfeld',
    fileSizeErr: 'Datei ist zu groß (maximal 30 MB)',
    fileFormatErr: 'Ungültiges Dateiformat (nur JPG, PNG, WEBP, PDF)',
    queryBtn: 'Anfrage senden',
    progressMsg: 'Die KI analysiert Ihre Anfrage...',
    exportPdfBtn: 'Als PDF exportieren',
    historyTitle: 'Verlauf',
    noHistory: 'Noch keine Abfragen im Verlauf.',
    manageTitle: 'Kategorien verwalten',
    newCategoryBtn: 'Kategorie erstellen',
    catName: 'Kategorie-Name',
    catDesc: 'Beschreibung',
    fieldsTitle: 'Eingabefelder (Ebene 1)',
    fieldLabel: 'Bezeichnung',
    fieldType: 'Feldtyp',
    fieldReq: 'Pflichtfeld',
    templateTitle: 'Prompt-Template (Ebene 2)',
    templatePlaceholder: 'z.B. Analysiere das Lied {Song-Titel}...',
    outputSectionsTitle: 'Gewünschte Ausgabe-Abschnitte (Ebene 3)',
    addSectionBtn: 'Abschnitt hinzufügen',
    addFieldBtn: 'Feld hinzufügen',
    saveCatBtn: 'Kategorie speichern',
    saveAsNewCatBtn: 'Als Kopie speichern',
    deleteCatConfirm: 'Möchten Sie diese Kategorie wirklich löschen?',
    noCategories: 'Keine Kategorien vorhanden.',
    fieldTypes: {
      text: 'Textfeld',
      textarea: 'Mehrzeilentext',
      file: 'Datei-Upload'
    },
    songAnalysisDefault: 'Song-Analyse',
    imageAnalysisDefault: 'Bild-Analyse',
    
    // New Library keys
    navLibrary: 'Bibliothek',
    libraryTitle: 'Zentrale Kategorie-Bibliothek',
    libraryApiLabel: 'Bibliotheks-API-URL (leer für Simulation)',
    libraryStatusNotInstalled: 'Nicht installiert',
    libraryStatusInstalled: 'Installiert',
    libraryStatusUpdate: 'Update verfügbar',
    libraryStatusModified: 'Lokale Änderungen',
    publishBtn: 'Veröffentlichen',
    publishTitle: 'Kategorie veröffentlichen',
    publishVersionLabel: 'Zielversion',
    publishNotesLabel: 'Versionshinweise / Changelog',
    publishSuccess: 'Erfolgreich in Bibliothek veröffentlicht!',
    installBtn: 'Installieren',
    rollbackBtn: 'Zurückrollen',
    historyVersions: 'Versionsverlauf',
    noLibraryCats: 'Keine Kategorien in der Bibliothek gefunden.',
    searchLibraryPlaceholder: 'Bibliothek durchsuchen...',
    libStatusOffline: 'Die Bibliothek ist zurzeit offline oder die API-URL ist ungültig.',
    localDraft: 'Lokaler Entwurf',
    localChanges: 'Lokale Änderungen',
    newVersion: 'Neue Version',
    releaseTypePatch: 'Patch (Kleine Korrektur/Anpassung)',
    releaseTypeMinor: 'Minor (Neue optionale Felder)',
    releaseTypeMajor: 'Major (Strukturelle Änderungen)',
    customVersion: 'Benutzerdefinierte Version'
  },
  en: {
    appName: 'KiKat',
    navQuery: 'Perform Query',
    navHistory: 'History',
    navManage: 'Manage Categories',
    navSettings: 'Settings',
    apiSettings: 'Gemini API Configuration',
    apiKeyLabel: 'Gemini API Key',
    apiModelLabel: 'Gemini Model',
    pdfPathLabel: 'Default PDF Export Path (Windows)',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    saveBtn: 'Save',
    savedMsg: 'Saved successfully!',
    reqFieldErr: 'This field is required',
    fileSizeErr: 'File is too large (max 30 MB)',
    fileFormatErr: 'Invalid file format (only JPG, PNG, WEBP, PDF)',
    queryBtn: 'Send Request',
    progressMsg: 'AI is analyzing your request...',
    exportPdfBtn: 'Export to PDF',
    historyTitle: 'History',
    noHistory: 'No queries in history yet.',
    manageTitle: 'Manage Categories',
    newCategoryBtn: 'Create Category',
    catName: 'Category Name',
    catDesc: 'Description',
    fieldsTitle: 'Input Fields (Level 1)',
    fieldLabel: 'Label',
    fieldType: 'Field Type',
    fieldReq: 'Required',
    templateTitle: 'Prompt Template (Level 2)',
    templatePlaceholder: 'e.g. Analyze the song {Song-Title}...',
    outputSectionsTitle: 'Desired Output Sections (Level 3)',
    addSectionBtn: 'Add Section',
    addFieldBtn: 'Add Field',
    saveCatBtn: 'Save Category',
    saveAsNewCatBtn: 'Save as Copy',
    deleteCatConfirm: 'Are you sure you want to delete this category?',
    noCategories: 'No categories available.',
    fieldTypes: {
      text: 'Text Input',
      textarea: 'Textarea',
      file: 'File Upload'
    },
    songAnalysisDefault: 'Song Analysis',
    imageAnalysisDefault: 'Image Analysis',

    // New Library keys
    navLibrary: 'Library',
    libraryTitle: 'Central Category Library',
    libraryApiLabel: 'Library API URL (empty for simulation)',
    libraryStatusNotInstalled: 'Not installed',
    libraryStatusInstalled: 'Installed',
    libraryStatusUpdate: 'Update available',
    libraryStatusModified: 'Local changes',
    publishBtn: 'Publish',
    publishTitle: 'Publish Category',
    publishVersionLabel: 'Target Version',
    publishNotesLabel: 'Release Notes / Changelog',
    publishSuccess: 'Published to library successfully!',
    installBtn: 'Install',
    rollbackBtn: 'Rollback',
    historyVersions: 'Version History',
    noLibraryCats: 'No categories found in library.',
    searchLibraryPlaceholder: 'Search library...',
    libStatusOffline: 'The library is currently offline or the API URL is invalid.',
    localDraft: 'Local Draft',
    localChanges: 'Local changes',
    newVersion: 'New Version',
    releaseTypePatch: 'Patch (Bugfix / small edit)',
    releaseTypeMinor: 'Minor (New optional fields)',
    releaseTypeMajor: 'Major (Structural changes)',
    customVersion: 'Custom Version'
  }
};

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'Song-Analyse',
    version: '1.1.6',
    libraryKey: 'song-analyse',
    isCustomized: false,
    description: 'Analyse von Liedern, Genres und textlichen/musikalischen Besonderheiten.',
    fields: [
      { name: 'interpret', label: 'Interpret', type: 'text', required: false },
      { name: 'titel', label: 'Song-Titel', type: 'text', required: false },
      { name: 'passage', label: 'Optionale Textpassage', type: 'textarea', required: false }
    ],
    template: "Erstelle einen strukturierten Bericht zum Song '{titel}' von '{interpret}'. Die folgende Textpassage wurde vom Nutzer bereitgestellt: {passage}\n\nDer Bericht soll folgende Abschnitte enthalten:\n1. Erscheinungsjahr\n2. Einordnung in Musikstil / Genre\n3. Musikalische Besonderheiten",
    outputSections: ['Erscheinungsjahr', 'Einordnung in Musikstil / Genre', 'Musikalische Besonderheiten']
  },
  {
    id: 2,
    name: 'Bild-Analyse',
    version: '1.0.0',
    libraryKey: 'bild-analyse',
    isCustomized: false,
    description: 'Detaillierte Analyse eines Bildes per Vision-API.',
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
  },
  {
    id: 3,
    name: 'Dokumentenverarbeitung',
    version: '1.0.0',
    libraryKey: 'dokumentenverarbeitung',
    isCustomized: false,
    description: 'Extrahierung strukturierter JSON-Daten aus Rechnungen und Belegen.',
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
];

export default function App() {
  const [activeTab, setActiveTab] = useState('query'); // query, history, manage, settings
  const [lang, setLang] = useState('de');
  const [theme, setTheme] = useState('dark');
  
  // Categories & Seeding
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  
  // Input Values & Results
  const [inputValues, setInputValues] = useState({});
  const [inputErrors, setInputErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [queryResult, setQueryResult] = useState(null); // Array of { title, content }

  // History State
  const [historyList, setHistoryList] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Category Editor State
  const [editingCategory, setEditingCategory] = useState(null); // null means new, or category object

  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3.1-flash-lite-preview');
  const [pdfPath, setPdfPath] = useState('');
  const [libraryApiUrl, setLibraryApiUrl] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [availableModels, setAvailableModels] = useState([
    { name: 'gemini-3.1-flash-lite-preview', displayName: 'Gemini 3.1 Flash Lite Preview' }
  ]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Library & Versioning States
  const [libraryCategories, setLibraryCategories] = useState([]);
  const [searchLibraryQuery, setSearchLibraryQuery] = useState('');
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState(null);

  // Publish Modal States
  const [publishingCategory, setPublishingCategory] = useState(null);
  const [publishTargetVersion, setPublishTargetVersion] = useState('1.0.0');
  const [publishChangelog, setPublishChangelog] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState(false);

  // Mobile Sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  // Initialize DB and load settings/categories
  useEffect(() => {
    async function loadData() {
      // 1. Theme
      const localTheme = await dbService.getSetting('theme', 'dark');
      setTheme(localTheme);
      document.documentElement.setAttribute('data-theme', localTheme);

      // 2. Language
      const localLang = await dbService.getSetting('language', 'de');
      setLang(localLang);

      // 3. API Key (Decrypted)
      const encKey = await dbService.getSetting('gemini_api_key', '');
      if (encKey) {
        const decrypted = await decryptData(encKey);
        setApiKey(decrypted);
      }

      // 4. Model
      const localModel = await dbService.getSetting('gemini_model', 'gemini-3.1-flash-lite-preview');
      setModel(localModel);

      // 5. PDF Path
      const localPdfPath = await dbService.getSetting('pdf_export_path', '');
      setPdfPath(localPdfPath);

      // 5b. Library API URL
      const localLibApiUrl = await dbService.getSetting('library_api_url', '');
      setLibraryApiUrl(localLibApiUrl);

      // 6. Load Categories
      let cats = await dbService.getAllCategories();
      let hasMissingDefaults = false;
      for (const defaultCat of DEFAULT_CATEGORIES) {
        if (!cats.find(c => c.name === defaultCat.name)) {
          const newCat = { ...defaultCat };
          delete newCat.id;
          try {
            await dbService.addCategory(newCat);
            hasMissingDefaults = true;
          } catch (e) {
            console.error('Failed to insert default category:', e);
          }
        }
      }
      if (cats.length === 0 || hasMissingDefaults) {
        cats = await dbService.getAllCategories();
      }
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCatId(cats[0].id);
      }

      // 7. Load History
      const hist = await dbService.getHistory();
      setHistoryList(hist);
    }
    loadData();
  }, []);

  // Fetch models automatically when opening settings or API key changes
  useEffect(() => {
    if (activeTab === 'settings' && apiKey && availableModels.length <= 1 && !isFetchingModels) {
      const fetchModels = async () => {
        setIsFetchingModels(true);
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const data = await res.json();
          if (data.models) {
            const validModels = data.models
              .filter(m => m.supportedGenerationMethods.includes('generateContent'))
              .map(m => ({
                name: m.name.replace('models/', ''),
                displayName: m.displayName || m.name.replace('models/', '')
              }));
            setAvailableModels(validModels);
            if (validModels.length > 0 && !validModels.find(m => m.name === model)) {
              setModel(validModels[0].name);
              dbService.saveSetting('gemini_model', validModels[0].name);
            }
          }
        } catch (err) {
          console.error('Fehler beim automatischen Laden der Modelle:', err);
        } finally {
          setIsFetchingModels(false);
        }
      };
      fetchModels();
    }
  }, [activeTab, apiKey, availableModels.length, isFetchingModels, model]);

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    await dbService.saveSetting('theme', newTheme);
  };

  const changeLang = async (newLang) => {
    setLang(newLang);
    await dbService.saveSetting('language', newLang);
  };

  const saveSettings = async () => {
    const encKey = await encryptData(apiKey);
    await dbService.saveSetting('gemini_api_key', encKey);
    await dbService.saveSetting('gemini_model', model);
    await dbService.saveSetting('pdf_export_path', pdfPath);
    await dbService.saveSetting('library_api_url', libraryApiUrl);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Reload categories helper
  const reloadCategories = async () => {
    const cats = await dbService.getAllCategories();
    setCategories(cats);
    return cats;
  };

  // Reload history helper
  const reloadHistory = async () => {
    const hist = await dbService.getHistory();
    setHistoryList(hist);
  };

  const generateExtendedTitle = (catName, inputs, suggestedTitle) => {
    const parts = [catName];

    if (catName === 'Song-Analyse') {
      const interpret = inputs['interpret'];
      const titel = inputs['titel'];
      if (interpret || titel) {
        parts.push([interpret, titel].filter(Boolean).join(' - '));
      }
    } else {
      if (suggestedTitle) {
        parts.push(suggestedTitle);
      }
      const filenameKey = Object.keys(inputs).find(k => k.endsWith('_filename'));
      if (filenameKey && inputs[filenameKey]) {
        parts.push(inputs[filenameKey]);
      } else {
        const textKey = Object.keys(inputs).find(k => inputs[k] && typeof inputs[k] === 'string' && !inputs[k].startsWith('data:') && !k.endsWith('_filename'));
        if (textKey && inputs[textKey]) {
parts.push(inputs[textKey].length > 30 ? inputs[textKey].substring(0, 30) + '...' : inputs[textKey]);
        }
      }
    }

    return parts.join(' - ');
  };

  // Handle Query Submission
  const handleQuerySubmit = async (e, customInputs = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError(null);
    setQueryResult(null);

    const activeCat = categories.find(c => c.id === selectedCatId);
    if (!activeCat) return;

    const currentInputs = customInputs || inputValues;

    // Validate inputs
    const errors = {};
    activeCat.fields.forEach(field => {
      if (field.required && !currentInputs[field.name]) {
        errors[field.name] = t.reqFieldErr;
      }
    });

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }
    setInputErrors({});

    setIsLoading(true);
    try {
      // Spezifische Logik für Song-Analyse:
      // "Wird sie befüllt sucht die KI Songs die diese Textpassage enthalten. Ein erfasster Interpret schränkt die Suche auf diesen Interpret ein. Der Song-Titel wird nicht berücksichtigt."
      let preparedCategory = { ...activeCat };
      let preparedInputs = { ...currentInputs };

      if (activeCat.name === 'Song-Analyse' && currentInputs['passage']) {
        // Adjust the query payload or instructions dynamically for Song-Analyse if passage is filled
        preparedCategory.template = "Sucht den Song, der die folgende Textpassage enthält: '{passage}'.\nEingeschränkter Interpret (falls vorhanden): '{interpret}'.\n\nDer Bericht soll folgende Abschnitte enthalten:\n1. Gefundener Song & Interpret\n2. Erscheinungsjahr\n3. Einordnung in Musikstil / Genre\n4. Musikalische Besonderheiten";
        preparedCategory.outputSections = ['Gefundener Song & Interpret', 'Erscheinungsjahr', 'Einordnung in Musikstil / Genre', 'Musikalische Besonderheiten'];
      }

      const { sections, suggestedTitle } = await sendGeminiQuery(preparedCategory, preparedInputs);
      setQueryResult(sections);

      // Save to History
      const cleanInputs = {};
      activeCat.fields.forEach(f => {
        // Store the value
        cleanInputs[f.name] = currentInputs[f.name];
        if (f.type === 'file' && currentInputs[`${f.name}_filename`]) {
          cleanInputs[`${f.name}_filename`] = currentInputs[`${f.name}_filename`];
        }
      });

      const historyEntry = {
        categoryId: activeCat.id,
        categoryName: activeCat.name,
        extendedTitle: generateExtendedTitle(activeCat.name, cleanInputs, suggestedTitle),
        inputs: cleanInputs,
        response: sections
      };
      await dbService.addHistoryEntry(historyEntry);
      await reloadHistory();
    } catch (err) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING' || err.message === 'API_KEY_INVALID') {
        setApiError(lang === 'de' ? 'API-Schlüssel ungültig oder nicht hinterlegt. Bitte überprüfen Sie Ihre Einstellungen.' : 'API Key invalid or missing. Please check your settings.');
      } else if (err.message === 'API_LIMIT_REACHED') {
        setApiError(lang === 'de' ? 'API-Limit erreicht. Bitte überprüfen Sie Ihr Google-Kontingent.' : 'API Limit reached. Please check your Google quota.');
      } else {
        setApiError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = (cat, inputs, resSections, customTitle = null) => {
    const title = customTitle || generateExtendedTitle(cat.name, inputs);
    const safeTitle = title.replace(/[^a-z0-9äöüß\-_]/gi, '_');
    const name = `${safeTitle}_${new Date().toISOString().slice(0,10)}.pdf`;
    exportToPDF(cat, inputs, resSections, name);
  };

  // File Upload Helpers
  const handleFileChange = (fieldName, file) => {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setInputErrors(prev => ({ ...prev, [fieldName]: t.fileSizeErr }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setInputErrors(prev => ({ ...prev, [fieldName]: t.fileFormatErr }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const nextInputs = { 
        ...inputValues, 
        [fieldName]: reader.result,
        [`${fieldName}_filename`]: file.name
      };
      setInputValues(nextInputs);
      setInputErrors(prev => ({ ...prev, [fieldName]: null }));
      
      // Auto-submit query directly after setting the file value!
      handleQuerySubmit(null, nextInputs);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewCategory = () => {
    setEditingCategory({
      name: '',
      description: '',
      fields: [{ name: 'feld1', label: 'Eingabe 1', type: 'text', required: false }],
      template: '',
      outputSections: ['Abschnitt 1']
    });
    setActiveTab('manage');
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(JSON.parse(JSON.stringify(cat)));
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) return;

    if (editingCategory.id) {
      // Mark as customized since a local edit was made
      const updatedCat = { ...editingCategory, isCustomized: true };
      await dbService.updateCategory(updatedCat);
    } else {
      // Create new category with draft state
      const slug = editingCategory.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const newCat = {
        ...editingCategory,
        version: '1.0.0',
        libraryKey: slug || `cat-${Date.now()}`,
        isCustomized: true
      };
      await dbService.addCategory(newCat);
    }
    const updated = await reloadCategories();
    setEditingCategory(null);
    if (updated.length > 0 && !selectedCatId) {
      setSelectedCatId(updated[0].id);
    }
  };

  const handleSaveAsNewCategory = async () => {
    if (!editingCategory.name.trim()) return;
    const copyData = { ...editingCategory };
    delete copyData.id;
    copyData.name = `${copyData.name} (Kopie)`;
    // Set as new customized category
    const slug = copyData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    copyData.libraryKey = slug || `cat-${Date.now()}`;
    copyData.version = '1.0.0';
    copyData.isCustomized = true;

    await dbService.addCategory(copyData);
    await reloadCategories();
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm(t.deleteCatConfirm)) {
      await dbService.deleteCategory(id);
      const updated = await reloadCategories();
      if (selectedCatId === id) {
        setSelectedCatId(updated.length > 0 ? updated[0].id : null);
      }
      setEditingCategory(null);
    }
  };

  // SemVer helper to suggest next version increments
  const suggestNextVersions = (currentVersion) => {
    const parts = (currentVersion || '1.0.0').split('.').map(p => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { patch: '1.0.1', minor: '1.1.0', major: '2.0.0' };
    }
    const [major, minor, patch] = parts;
    return {
      patch: `${major}.${minor}.${patch + 1}`,
      minor: `${major}.${minor + 1}.0`,
      major: `${major + 1}.0.0`
    };
  };

  // Central Library API actions
  const loadLibrary = async () => {
    setIsLibraryLoading(true);
    setLibraryError(null);
    try {
      const data = await libraryService.getCategories(libraryApiUrl);
      setLibraryCategories(data);
    } catch (err) {
      console.error(err);
      setLibraryError(t.libStatusOffline);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  // Fetch library data when changing tabs to Library
  useEffect(() => {
    if (activeTab === 'library') {
      const timer = setTimeout(() => {
        loadLibrary();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, libraryApiUrl]);

  const handleOpenPublish = (cat) => {
    setPublishingCategory(cat);
    const suggestions = suggestNextVersions(cat.version);
    setPublishTargetVersion(suggestions.patch);
    setPublishChangelog('');
    setPublishSuccessMsg(false);
  };

  const handlePublishCategory = async () => {
    if (!publishingCategory) return;
    setIsPublishing(true);
    try {
      const payload = {
        name: publishingCategory.name,
        libraryKey: publishingCategory.libraryKey,
        version: publishTargetVersion,
        description: publishingCategory.description,
        fields: publishingCategory.fields,
        template: publishingCategory.template,
        outputSections: publishingCategory.outputSections,
        changelog: publishChangelog
      };

      await libraryService.publishCategory(libraryApiUrl, payload);

      // Save updated version status locally & reset isCustomized
      const updatedCat = {
        ...publishingCategory,
        version: publishTargetVersion,
        isCustomized: false
      };
      await dbService.updateCategory(updatedCat);
      await reloadCategories();

      setPublishSuccessMsg(true);
      setTimeout(() => {
        setPublishingCategory(null);
        setPublishSuccessMsg(false);
      }, 1500);

      // Refresh lists if relevant
      loadLibrary();
    } catch (err) {
      alert(lang === 'de' ? 'Fehler beim Veröffentlichen: ' + err.message : 'Error publishing: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleInstallLibraryCategory = async (libCat, targetVerObj) => {
    try {
      const existing = categories.find(c => c.libraryKey === libCat.libraryKey);

      const newLocalCat = {
        name: libCat.name,
        description: libCat.description || targetVerObj.description,
        libraryKey: libCat.libraryKey,
        version: targetVerObj.version,
        isCustomized: false,
        fields: targetVerObj.fields,
        template: targetVerObj.template,
        outputSections: targetVerObj.outputSections
      };

      if (existing) {
        newLocalCat.id = existing.id;
        await dbService.updateCategory(newLocalCat);
      } else {
        await dbService.addCategory(newLocalCat);
      }

      await reloadCategories();
      alert(lang === 'de'
        ? `Kategorie "${libCat.name}" (v${targetVerObj.version}) erfolgreich installiert/aktualisiert!`
        : `Category "${libCat.name}" (v${targetVerObj.version}) installed/updated successfully!`
      );
      loadLibrary();
    } catch (err) {
      alert(lang === 'de' ? 'Fehler bei Installation: ' + err.message : 'Installation error: ' + err.message);
    }
  };

  // Add/Remove dynamic inputs inside Category Creator
  const addFieldToEditor = () => {
    const count = editingCategory.fields.length + 1;
    setEditingCategory(prev => ({
      ...prev,
      fields: [...prev.fields, { name: `feld${count}`, label: `Eingabe ${count}`, type: 'text', required: false }]
    }));
  };

  const removeFieldFromEditor = (index) => {
    setEditingCategory(prev => ({
      ...prev,
      fields: prev.fields.filter((_, idx) => idx !== index)
    }));
  };

  const updateFieldInEditor = (index, key, val) => {
    setEditingCategory(prev => {
      const copy = [...prev.fields];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, fields: copy };
    });
  };

  const addOutputSectionToEditor = () => {
    setEditingCategory(prev => ({
      ...prev,
      outputSections: [...prev.outputSections, `Abschnitt ${prev.outputSections.length + 1}`]
    }));
  };

  const removeOutputSectionFromEditor = (index) => {
    setEditingCategory(prev => ({
      ...prev,
      outputSections: prev.outputSections.filter((_, idx) => idx !== index)
    }));
  };

  const updateOutputSectionInEditor = (index, val) => {
    setEditingCategory(prev => {
      const copy = [...prev.outputSections];
      copy[index] = val;
      return { ...prev, outputSections: copy };
    });
  };

  // Render Functions
  const activeCat = categories.find(c => c.id === selectedCatId);

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={26} />
            <span>{t.appName}</span>
          </div>
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-menu">
          <div
            className={`sidebar-item ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => { setActiveTab('query'); setMobileMenuOpen(false); }}
          >
            <ChevronRight size={18} />
            {t.navQuery}
          </div>
          <div
            className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); setSelectedHistoryItem(null); }}
          >
            <History size={18} />
            {t.navHistory}
          </div>
          <div
            className={`sidebar-item ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage'); setMobileMenuOpen(false); setEditingCategory(null); }}
          >
            <Edit3 size={18} />
            {t.navManage}
          </div>
          <div
            className={`sidebar-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }}
          >
            <BookOpen size={18} />
            {t.navLibrary}
          </div>
          <div
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
          >
            <SettingsIcon size={18} />
            {t.navSettings}
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-secondary" onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="main-layout">
        <header className="top-bar">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <span>
              {activeTab === 'query' && t.navQuery}
              {activeTab === 'history' && t.navHistory}
              {activeTab === 'manage' && t.navManage}
              {activeTab === 'library' && t.navLibrary}
              {activeTab === 'settings' && t.navSettings}
            </span>
          </div>
          <div className="top-bar-actions">
            <button className="btn btn-secondary" onClick={() => changeLang(lang === 'de' ? 'en' : 'de')}>
              <Languages size={16} />
              {lang.toUpperCase()}
            </button>
          </div>
        </header>

        <main className="content-body">
          {/* TAB 1: PERFORM QUERY */}
          {activeTab === 'query' && (
            <div className="grid-layout">
              {categories.length === 0 ? (
                <div className="card text-center">
                  <p>{t.noCategories}</p>
                  <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={handleAddNewCategory}>
                    <Plus size={16} /> {t.newCategoryBtn}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="tabs">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`tab-btn ${selectedCatId === cat.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCatId(cat.id);
                          setInputValues({});
                          setQueryResult(null);
                          setApiError(null);
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {activeCat && (
                    <div className="card">
                      <h2 style={{ marginBottom: '8px' }}>{activeCat.name}</h2>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                        {activeCat.description}
                      </p>

                      <form onSubmit={handleQuerySubmit}>
                        {activeCat.fields.map(field => (
                          <div className="form-group" key={field.name}>
                            <label className="form-label">
                              {field.label}
                              {field.required && <span className="required-dot">*</span>}
                            </label>
                            
                            {field.type === 'text' && (
                              <input
                                type="text"
                                className={`input-control ${inputErrors[field.name] ? 'error' : ''}`}
                                value={inputValues[field.name] || ''}
                                onChange={e => setInputValues({ ...inputValues, [field.name]: e.target.value })}
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                className={`input-control ${inputErrors[field.name] ? 'error' : ''}`}
                                rows={4}
                                value={inputValues[field.name] || ''}
                                onChange={e => setInputValues({ ...inputValues, [field.name]: e.target.value })}
                              />
                            )}

                            {field.type === 'file' && (
                              <div>
                                {!inputValues[field.name] ? (
                                  <div
                                    className={`file-dropzone ${inputErrors[field.name] ? 'error' : ''}`}
                                    onClick={() => document.getElementById(`file-${field.name}`).click()}
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
                                    onDragLeave={e => e.currentTarget.classList.remove('dragging')}
                                    onDrop={e => {
                                      e.preventDefault();
                                      e.currentTarget.classList.remove('dragging');
                                      if (e.dataTransfer.files.length > 0) {
                                        handleFileChange(field.name, e.dataTransfer.files[0]);
                                      }
                                    }}
                                  >
                                    <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                                    <p style={{ fontSize: '13px' }}>
                                      {lang === 'de' ? 'Bild/PDF per Drag & Drop hierhin ziehen oder klicken' : 'Drag & drop image/PDF here or click to select'}
                                    </p>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, WEBP, PDF (Max 30MB)</span>
                                  </div>
                                ) : (
                                  <div 
                                    className="file-preview"
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
                                    onDragLeave={e => e.currentTarget.classList.remove('dragging')}
                                    onDrop={e => {
                                      e.preventDefault();
                                      e.currentTarget.classList.remove('dragging');
                                      if (e.dataTransfer.files.length > 0) {
                                        handleFileChange(field.name, e.dataTransfer.files[0]);
                                      }
                                    }}
                                  >
                                    {inputValues[field.name].startsWith('data:application/pdf') ? (
                                      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>📄 PDF-Dokument angehängt</div>
                                    ) : (
                                      <img src={inputValues[field.name]} alt="Preview" />
                                    )}
                                    <button
                                      type="button"
                                      className="remove-file-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInputValues({ ...inputValues, [field.name]: '' });
                                      }}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  id={`file-${field.name}`}
                                  style={{ display: 'none' }}
                                  accept="image/png, image/jpeg, image/webp, application/pdf"
                                  onChange={e => handleFileChange(field.name, e.target.files[0])}
                                />
                              </div>
                            )}

                            {inputErrors[field.name] && (
                              <span className="error-text">{inputErrors[field.name]}</span>
                            )}
                          </div>
                        ))}

                        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '10px' }}>
                          {t.queryBtn}
                        </button>
                      </form>

                      {/* LOADING PROGRESS BAR */}
                      {isLoading && (
                        <div className="progress-overlay" style={{ marginTop: '20px' }}>
                          <div className="spinner"></div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.progressMsg}</p>
                        </div>
                      )}

                      {/* API ERROR BAR */}
                      {apiError && (
                        <div className="card" style={{ borderLeft: '4px solid var(--error)', marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <AlertCircle size={24} style={{ color: 'var(--error)' }} />
                          <div>
                            <p style={{ color: 'var(--error)', fontSize: '14px', fontWeight: 600 }}>Fehler bei Abfrage</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                              {apiError}
                              {' '}
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent)',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                  padding: '0',
                                  fontSize: '13px',
                                  fontFamily: 'inherit',
                                  fontWeight: '500'
                                }}
                                onClick={() => setActiveTab('settings')}
                              >
                                {lang === 'de' ? 'Hier geht es zu den Einstellungen.' : 'Go to Settings.'}
                              </button>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* RENDER DYNAMIC OUTPUT SECTIONS */}
                      {queryResult && (
                        <div style={{ marginTop: '30px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3>KI-Ergebnis</h3>
                            <button className="btn btn-secondary" onClick={() => handleExportPDF(activeCat, inputValues, queryResult)}>
                              <Download size={16} />
                              {t.exportPdfBtn}
                            </button>
                          </div>
                          
                          {queryResult.map((section, idx) => (
                            <div className="result-section" key={idx}>
                              <h3>{section.title}</h3>
                              <div className="markdown-body">
                                <ReactMarkdown>{section.content}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <div>
              {selectedHistoryItem ? (
                <div>
                  <button className="btn btn-secondary" style={{ marginBottom: '20px' }} onClick={() => setSelectedHistoryItem(null)}>
                    Zurück zum Verlauf
                  </button>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h2>{selectedHistoryItem.extendedTitle || selectedHistoryItem.categoryName}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(selectedHistoryItem.timestamp).toLocaleString('de-DE')}
                        </p>
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          const catObj = categories.find(c => c.id === selectedHistoryItem.categoryId) || {
                            name: selectedHistoryItem.categoryName,
                            fields: Object.keys(selectedHistoryItem.inputs).map(k => ({ name: k, label: k }))
                          };
                          handleExportPDF(catObj, selectedHistoryItem.inputs, selectedHistoryItem.response);
                        }}
                      >
                        <Download size={16} />
                        {t.exportPdfBtn}
                      </button>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Ebene 1 - Eingabeparameter</h4>
                      <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                        {Object.entries(selectedHistoryItem.inputs).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>{k}:</strong>
                            <span>{v && String(v).startsWith('data:') ? '[Bilddatei]' : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>KI-Antworten</h4>
                      {selectedHistoryItem.response.map((sec, idx) => (
                        <div className="result-section" key={idx}>
                          <h3>{sec.title}</h3>
                          <div className="markdown-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{sec.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <h2>{t.historyTitle}</h2>
                  {historyList.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>{t.noHistory}</p>
                  ) : (
                    <div className="history-list" style={{ marginTop: '20px' }}>
                      {historyList.map(item => (
                        <div key={item.id} className="history-item" onClick={() => setSelectedHistoryItem(item)}>
                          <div className="history-item-details">
                            <h4>{item.extendedTitle || item.categoryName}</h4>
                            <p>{new Date(item.timestamp).toLocaleString('de-DE')}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '6px 10px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const catObj = categories.find(c => c.id === item.categoryId) || {
                                  name: item.categoryName,
                                  fields: Object.keys(item.inputs).map(k => ({ name: k, label: k }))
                                };
                                handleExportPDF(catObj, item.inputs, item.response, item.extendedTitle);
                              }}
                            >
                              <Download size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '6px 10px' }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(lang === 'de' ? 'Eintrag löschen?' : 'Delete history log?')) {
                                  await dbService.deleteHistoryEntry(item.id);
                                  reloadHistory();
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE CATEGORIES */}
          {activeTab === 'manage' && (
            <div>
              {editingCategory ? (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{editingCategory.id ? 'Kategorie bearbeiten' : 'Kategorie neu erstellen'}</h2>
                    <button className="btn btn-secondary" onClick={() => setEditingCategory(null)}>Abbrechen</button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.catName}</label>
                    <input
                      type="text"
                      className="input-control"
                      value={editingCategory.name}
                      onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.catDesc}</label>
                    <input
                      type="text"
                      className="input-control"
                      value={editingCategory.description || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '12px' }}>{t.fieldsTitle}</h3>
                    {editingCategory.fields.map((field, idx) => (
                      <div className="builder-row" key={idx} style={{ marginBottom: '10px' }}>
                        <div>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="z.B. interpret"
                            value={field.name}
                            onChange={e => updateFieldInEditor(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="Anzeige-Label (z.B. Interpret)"
                            value={field.label}
                            onChange={e => updateFieldInEditor(idx, 'label', e.target.value)}
                          />
                        </div>
                        <div>
                          <select
                            className="input-control"
                            value={field.type}
                            onChange={e => updateFieldInEditor(idx, 'type', e.target.value)}
                          >
                            <option value="text">Textfeld</option>
                            <option value="textarea">Mehrzeilentext</option>
                            <option value="file">Datei-Upload</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={e => updateFieldInEditor(idx, 'required', e.target.checked)}
                            />
                            {t.fieldReq}
                          </label>
                          <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => removeFieldFromEditor(idx)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-secondary" onClick={addFieldToEditor}>
                      <Plus size={14} />
                      {t.addFieldBtn}
                    </button>
                  </div>

                  <div className="form-group">
                    <h3 style={{ marginBottom: '10px' }}>{t.templateTitle}</h3>
                    <textarea
                      className="input-control"
                      rows={8}
                      placeholder={t.templatePlaceholder}
                      value={editingCategory.template}
                      onChange={e => setEditingCategory({ ...editingCategory, template: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '12px' }}>{t.outputSectionsTitle}</h3>
                    {editingCategory.outputSections.map((section, idx) => (
                      <div 
                        className="output-section-row" 
                        key={idx}
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', idx.toString()); }}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.opacity = '0.5'; }}
                        onDragLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.opacity = '1';
                          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                          if (fromIdx !== idx && !isNaN(fromIdx)) {
                            const newSections = [...editingCategory.outputSections];
                            const [moved] = newSections.splice(fromIdx, 1);
                            newSections.splice(idx, 0, moved);
                            setEditingCategory({ ...editingCategory, outputSections: newSections });
                          }
                        }}
                        style={{ cursor: 'grab', display: 'flex', gap: '8px', marginBottom: '8px' }}
                      >
                        <input
                          type="text"
                          className="input-control"
                          value={section}
                          onChange={e => updateOutputSectionInEditor(idx, e.target.value)}
                        />
                        <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => removeOutputSectionFromEditor(idx)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-secondary" onClick={addOutputSectionToEditor}>
                      <Plus size={14} />
                      {t.addSectionBtn}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className="btn btn-primary" onClick={handleSaveCategory}>
                      <Save size={16} />
                      {t.saveCatBtn}
                    </button>
                    {editingCategory.id && (
                      <button className="btn btn-secondary" onClick={handleSaveAsNewCategory}>
                        <Copy size={16} />
                        {t.saveAsNewCatBtn}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{t.manageTitle}</h2>
                    <button className="btn btn-primary" onClick={handleAddNewCategory}>
                      <Plus size={16} />
                      {t.newCategoryBtn}
                    </button>
                  </div>

                  <div className="history-list">
                    {categories.map(cat => (
                      <div key={cat.id} className="history-item" style={{ cursor: 'default', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '16px' }}>{cat.name}</h4>
                            <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              v{cat.version || '1.0.0'}
                            </span>
                            {cat.isCustomized && (
                              <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--warning)', borderRadius: '4px', fontWeight: '500' }}>
                                {t.localChanges}
                              </span>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>{cat.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }} 
                            onClick={() => handleOpenPublish(cat)}
                          >
                            <UploadCloud size={14} />
                            <span>{t.publishBtn}</span>
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleEditCategory(cat)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="card">
              <h2>{t.navSettings}</h2>
              <div className="settings-grid" style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label className="form-label">{t.apiKeyLabel}</label>
                  <input
                    type="password"
                    className="input-control"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                  />
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-link"
                      style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <SettingsIcon size={12} />
                      {lang === 'de' ? 'Google API-Quota & Limits überprüfen' : 'Check Google API Quota & Limits'}
                    </a>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.apiModelLabel}</label>
                  <select 
                    className="input-control" 
                    value={model} 
                    onChange={async (e) => {
                      const newModel = e.target.value;
                      setModel(newModel);
                      await dbService.saveSetting('gemini_model', newModel);
                    }}
                    disabled={isFetchingModels || !apiKey}
                  >
                    {isFetchingModels ? (
                      <option value={model}>Lade Modelle...</option>
                    ) : (
                      availableModels.map(m => (
                        <option key={m.name} value={m.name}>{m.displayName} ({m.name})</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.pdfPathLabel}</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="C:\Users\...\Documents"
                    value={pdfPath}
                    onChange={e => setPdfPath(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.libraryApiLabel}</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="https://yourserver.com/api/library.php"
                    value={libraryApiUrl}
                    onChange={e => setLibraryApiUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.languageLabel}</label>
                  <select className="input-control" value={lang} onChange={e => changeLang(e.target.value)}>
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-primary" onClick={saveSettings}>
                  <Save size={16} />
                  {t.saveBtn}
                </button>
                {settingsSaved && (
                  <span style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={16} />
                    {t.savedMsg}
                  </span>
                )}
              </div>
              <div style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                v{appVersion}
              </div>
            </div>
          )}

          {/* TAB 5: LIBRARY */}
          {activeTab === 'library' && (
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2>{t.libraryTitle}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                      {libraryApiUrl 
                        ? (lang === 'de' ? `Verbunden mit: ${libraryApiUrl}` : `Connected to: ${libraryApiUrl}`)
                        : (lang === 'de' ? 'Lokaler Simulationsmodus (Sandbox)' : 'Local Simulation Mode (Sandbox)')}
                    </p>
                  </div>
                  <button className="btn btn-secondary" onClick={loadLibrary} disabled={isLibraryLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={14} className={isLibraryLoading ? 'spin-animation' : ''} />
                    <span>{lang === 'de' ? 'Aktualisieren' : 'Refresh'}</span>
                  </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder={t.searchLibraryPlaceholder}
                    value={searchLibraryQuery}
                    onChange={e => setSearchLibraryQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLibraryLoading ? (
                <div className="card text-center" style={{ padding: '40px' }}>
                  <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                  <p style={{ color: 'var(--text-secondary)' }}>{lang === 'de' ? 'Lade Bibliothek...' : 'Loading library...'}</p>
                </div>
              ) : libraryError ? (
                <div className="card text-center" style={{ borderLeft: '4px solid var(--error)', padding: '30px' }}>
                  <AlertCircle size={32} style={{ color: 'var(--error)', margin: '0 auto 12px' }} />
                  <h3 style={{ color: 'var(--error)', marginBottom: '8px' }}>{lang === 'de' ? 'Verbindung fehlgeschlagen' : 'Connection Failed'}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
                    {libraryError}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {libraryCategories.length === 0 ? (
                    <div className="card text-center" style={{ padding: '30px' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>{t.noLibraryCats}</p>
                    </div>
                  ) : (
                    libraryCategories
                      .filter(libCat => libCat.name.toLowerCase().includes(searchLibraryQuery.toLowerCase()) || 
                                         (libCat.description || '').toLowerCase().includes(searchLibraryQuery.toLowerCase()))
                      .map(libCat => {
                        // Find matching local category
                        const localCat = categories.find(c => c.libraryKey === libCat.libraryKey);
                        
                        // Determine status
                        let statusText = t.libraryStatusNotInstalled;
                        let statusColor = 'rgba(255,255,255,0.08)';
                        let textColor = 'var(--text-secondary)';
                        
                        if (localCat) {
                          if (localCat.version === libCat.latestVersion) {
                            if (localCat.isCustomized) {
                              statusText = t.libraryStatusModified;
                              statusColor = 'rgba(245, 158, 11, 0.15)';
                              textColor = 'var(--warning)';
                            } else {
                              statusText = t.libraryStatusInstalled;
                              statusColor = 'rgba(16, 185, 129, 0.15)';
                              textColor = 'var(--success)';
                            }
                          } else {
                            statusText = t.libraryStatusUpdate;
                            statusColor = 'rgba(99, 102, 241, 0.15)';
                            textColor = 'var(--accent)';
                          }
                        }

                        return (
                          <div key={libCat.libraryKey} className="card" style={{ borderLeft: localCat ? `4px solid ${textColor}` : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                              <div>
                                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {libCat.name}
                                  <span style={{ fontSize: '12px', padding: '3px 8px', background: statusColor, color: textColor, borderRadius: '6px', fontWeight: '500' }}>
                                    {statusText}
                                  </span>
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                                  {lang === 'de' ? `Neueste Version: v${libCat.latestVersion}` : `Latest Version: v${libCat.latestVersion}`}
                                </p>
                              </div>
                            </div>
                            
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                              {libCat.description}
                            </p>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                              <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <History size={14} />
                                <span>{t.historyVersions}</span>
                              </h4>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {libCat.versions && [...libCat.versions].reverse().map(verObj => {
                                  const isCurrentLocalVersion = localCat && localCat.version === verObj.version;
                                  let actionText = t.installBtn;
                                  let isRollback = false;
                                  
                                  if (localCat) {
                                    if (localCat.version !== verObj.version) {
                                      const localVerIdx = libCat.versions.findIndex(v => v.version === localCat.version);
                                      const thisVerIdx = libCat.versions.findIndex(v => v.version === verObj.version);
                                      if (localVerIdx !== -1 && thisVerIdx < localVerIdx) {
                                        actionText = t.rollbackBtn;
                                        isRollback = true;
                                      } else {
                                        actionText = t.installBtn;
                                      }
                                    }
                                  }

                                  return (
                                    <div key={verObj.version} style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                      <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <strong style={{ fontSize: '13px' }}>v{verObj.version}</strong>
                                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({verObj.date ? verObj.date.substring(0,10) : ''})</span>
                                        </div>
                                        {verObj.changelog && (
                                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                                            &ldquo;{verObj.changelog}&rdquo;
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div>
                                        {isCurrentLocalVersion && !localCat.isCustomized ? (
                                          <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={16} />
                                            <span>{t.libraryStatusInstalled}</span>
                                          </span>
                                        ) : (
                                          <button 
                                            className={`btn btn-sm ${isRollback ? 'btn-danger' : 'btn-primary'}`} 
                                            onClick={() => handleInstallLibraryCategory(libCat, verObj)}
                                            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                          >
                                            <CloudDownload size={12} />
                                            <span>{actionText}</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* PUBLISH MODAL */}
      {publishingCategory && (
        <div className="modal-backdrop" onClick={() => setPublishingCategory(null)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{t.publishTitle}</h2>
              <button onClick={() => setPublishingCategory(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {publishSuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                  <Check size={32} />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--success)' }}>{t.publishSuccess}</p>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  {lang === 'de' 
                    ? `Veröffentliche Kategorie "${publishingCategory.name}" (Lokale Version: v${publishingCategory.version || '1.0.0'})` 
                    : `Publishing category "${publishingCategory.name}" (Local version: v${publishingCategory.version || '1.0.0'})`}
                </p>

                <div className="form-group">
                  <label className="form-label">{t.publishVersionLabel}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {(() => {
                      const suggestions = suggestNextVersions(publishingCategory.version);
                      return (
                        <>
                          <button 
                            type="button" 
                            className={`btn ${publishTargetVersion === suggestions.patch ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPublishTargetVersion(suggestions.patch)}
                            style={{ fontSize: '12px', padding: '8px 4px' }}
                          >
                            <div>Patch</div>
                            <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '2px' }}>v{suggestions.patch}</div>
                          </button>
                          <button 
                            type="button" 
                            className={`btn ${publishTargetVersion === suggestions.minor ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPublishTargetVersion(suggestions.minor)}
                            style={{ fontSize: '12px', padding: '8px 4px' }}
                          >
                            <div>Minor</div>
                            <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '2px' }}>v{suggestions.minor}</div>
                          </button>
                          <button 
                            type="button" 
                            className={`btn ${publishTargetVersion === suggestions.major ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPublishTargetVersion(suggestions.major)}
                            style={{ fontSize: '12px', padding: '8px 4px' }}
                          >
                            <div>Major</div>
                            <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '2px' }}>v{suggestions.major}</div>
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.customVersion}:</span>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={publishTargetVersion} 
                      onChange={e => setPublishTargetVersion(e.target.value)}
                      style={{ padding: '6px 12px', fontSize: '13px', width: '100px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.publishNotesLabel}</label>
                  <textarea 
                    className="input-control" 
                    rows={4} 
                    placeholder={lang === 'de' ? 'z.B. Feld X hinzugefügt, Fehler behoben' : 'e.g. Added field X, fixed bugs'}
                    value={publishChangelog} 
                    onChange={e => setPublishChangelog(e.target.value)}
                  />
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  onClick={handlePublishCategory}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff' }}></div>
                  ) : (
                    <UploadCloud size={16} />
                  )}
                  <span>{t.publishBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
