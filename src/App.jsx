import React, { useState, useEffect, useRef } from 'react';
import { dbService } from './utils/db';
import { encryptData, decryptData } from './utils/crypto';
import { sendGeminiQuery } from './utils/gemini';
import { exportToPDF } from './utils/pdf';
import {
  FileText,
  History,
  Settings as SettingsIcon,
  FolderOpen,
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
  Check
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
    fileFormatErr: 'Ungültiges Dateiformat (nur JPG, PNG, WEBP)',
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
    imageAnalysisDefault: 'Bild-Analyse'
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
    fileFormatErr: 'Invalid file format (only JPG, PNG, WEBP)',
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
    imageAnalysisDefault: 'Image Analysis'
  }
};

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'Song-Analyse',
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
  const [model, setModel] = useState('gemini-1.5-flash');
  const [pdfPath, setPdfPath] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

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
      const localModel = await dbService.getSetting('gemini_model', 'gemini-1.5-flash');
      setModel(localModel);

      // 5. PDF Path
      const localPdfPath = await dbService.getSetting('pdf_export_path', '');
      setPdfPath(localPdfPath);

      // 6. Load Categories
      let cats = await dbService.getAllCategories();
      if (cats.length === 0) {
        // Seed default categories
        for (const defaultCat of DEFAULT_CATEGORIES) {
          await dbService.addCategory(defaultCat);
        }
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

  // Handle Query Submission
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setQueryResult(null);

    const activeCat = categories.find(c => c.id === selectedCatId);
    if (!activeCat) return;

    // Validate inputs
    const errors = {};
    activeCat.fields.forEach(field => {
      if (field.required && !inputValues[field.name]) {
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
      let preparedInputs = { ...inputValues };

      if (activeCat.name === 'Song-Analyse' && inputValues['passage']) {
        // Adjust the query payload or instructions dynamically for Song-Analyse if passage is filled
        preparedCategory.template = "Sucht Songs, die die folgende Textpassage enthalten: '{passage}'.\nEingeschränkter Interpret (falls vorhanden): '{interpret}'. Der Song-Titel wird nicht berücksichtigt.\n\nDer Bericht soll folgende Abschnitte enthalten:\n1. Erscheinungsjahr\n2. Einordnung in Musikstil / Genre\n3. Musikalische Besonderheiten";
      }

      const resultSections = await sendGeminiQuery(preparedCategory, preparedInputs);
      setQueryResult(resultSections);

      // Save to History
      const cleanInputs = {};
      activeCat.fields.forEach(f => {
        // Do not store full base64 file data directly to keep history clean, or store it (since IndexedDB handles large records)
        // Store the value
        cleanInputs[f.name] = inputValues[f.name];
      });

      const historyEntry = {
        categoryId: activeCat.id,
        categoryName: activeCat.name,
        inputs: cleanInputs,
        response: resultSections
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

  const handleExportPDF = (cat, inputs, resSections) => {
    const name = `${cat.name}_Bericht_${new Date().toISOString().slice(0,10)}.pdf`;
    exportToPDF(cat, inputs, resSections, name);
  };

  // File Upload Helpers
  const handleFileChange = (fieldName, file) => {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setInputErrors(prev => ({ ...prev, [fieldName]: t.fileSizeErr }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setInputErrors(prev => ({ ...prev, [fieldName]: t.fileFormatErr }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setInputValues(prev => ({ ...prev, [fieldName]: reader.result }));
      setInputErrors(prev => ({ ...prev, [fieldName]: null }));
    };
    reader.readAsDataURL(file);
  };

  // Category CRUD Operations
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
      await dbService.updateCategory(editingCategory);
    } else {
      await dbService.addCategory(editingCategory);
    }
    const updated = await reloadCategories();
    setEditingCategory(null);
    if (updated.length > 0 && !selectedCatId) {
      setSelectedCatId(updated[0].id);
    }
  };

  const handleSaveAsNewCategory = async () => {
    if (!editingCategory.name.trim()) return;
    const { id, ...copyData } = editingCategory;
    copyData.name = `${copyData.name} (Kopie)`;
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
        <div className="sidebar-brand">
          <FileText size={26} />
          <span>{t.appName}</span>
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
          <div className="page-title">
            {activeTab === 'query' && t.navQuery}
            {activeTab === 'history' && t.navHistory}
            {activeTab === 'manage' && t.navManage}
            {activeTab === 'settings' && t.navSettings}
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
                                      {lang === 'de' ? 'Bild per Drag & Drop hierhin ziehen oder klicken' : 'Drag & drop image here or click to select'}
                                    </p>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, WEBP (Max 30MB)</span>
                                  </div>
                                ) : (
                                  <div className="file-preview">
                                    <img src={inputValues[field.name]} alt="Preview" />
                                    <button
                                      type="button"
                                      className="remove-file-btn"
                                      onClick={() => setInputValues({ ...inputValues, [field.name]: '' })}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  id={`file-${field.name}`}
                                  style={{ display: 'none' }}
                                  accept="image/png, image/jpeg, image/webp"
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
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{apiError}</p>
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
                                <p style={{ whiteSpace: 'pre-wrap' }}>{section.content}</p>
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
                        <h2>{selectedHistoryItem.categoryName}</h2>
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
                            <h4>{item.categoryName}</h4>
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
                                handleExportPDF(catObj, item.inputs, item.response);
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
                      rows={4}
                      placeholder={t.templatePlaceholder}
                      value={editingCategory.template}
                      onChange={e => setEditingCategory({ ...editingCategory, template: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '12px' }}>{t.outputSectionsTitle}</h3>
                    {editingCategory.outputSections.map((section, idx) => (
                      <div className="output-section-row" key={idx}>
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
                      <div key={cat.id} className="history-item" style={{ cursor: 'default' }}>
                        <div>
                          <h4 style={{ fontSize: '16px' }}>{cat.name}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{cat.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                </div>

                <div className="form-group">
                  <label className="form-label">{t.apiModelLabel}</label>
                  <select className="input-control" value={model} onChange={e => setModel(e.target.value)}>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
