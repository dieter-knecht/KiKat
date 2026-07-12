# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-12

### Added
- **Zentrale Kategorie-Bibliothek**: Einführung einer zentralen Bibliothek zum Teilen und Verwalten von Abfrage-Kategorien.
- **Kategorie-Versionierung**: Unterstützung von Versionen (SemVer wie Patch/Minor/Major) für einzelne Kategorien.
- **Rollback & Update**: Möglichkeit, ältere Versionen einer Kategorie aus der Bibliothek herunterzuladen und lokal zu aktivieren (Rollback) oder bestehende Kategorien zu aktualisieren.
- **Änderungsverfolgung**: Anzeige lokaler ungespeicherter Anpassungen ("Lokale Änderungen") bei lokal geänderten Kategorien.
- **Offline-Resilienz**: Vollständige Offline-Fähigkeit aller lokalen Abfragen und Kategorien dank lokaler IndexedDB-Speicherung.
- **Begleit-Server**: Bereitstellung eines minimalen PHP-Backends (`api/library.php`) für Shared-Webhostings und eines Node.js-Backends (`server/index.js`) für eigene Server.
- **Konfiguration**: Einstellbare API-URL für die Bibliothek in den Einstellungen, inklusive automatischem Sandbox-Simulationsmodus bei leerer URL.

## [1.1.6] - 2026-06-24

### Fixed
- **Song Analysis**: Fixed a logic error where searching by text passage skipped the song identification. The AI is now explicitly prompted to output "Gefundener Song & Interpret".
- **AI Stability**: Gemini API calls now utilize `system_instruction`, strict JSON `responseSchema`, and a lower `temperature` (0.3) for significantly more reliable and accurate factual analysis without hallucinated or broken JSON.

## [1.1.5] - 2026-06-19

### Added
- **Auto-Submission**: Queries are now automatically submitted immediately when a file is successfully uploaded or dropped.

## [1.1.4] - 2026-06-19

### Added
- **File Upload Enhancement**: Allowed direct drag-and-drop replacement of existing uploaded files in the preview area.

## [1.1.3] - 2026-06-19

### Added
- **PWA Integration**: Configured Progressive Web App (PWA) using `vite-plugin-pwa` with auto-updates and app manifest.
- **AI Integration**: Switched the default model to `gemini-3.1-flash-lite-preview` and restructured query responses to support suggested titles.

### Changed
- **UI**: Doubled the size of the "Prompt-Template (Ebene 2)" textarea from 4 to 8 rows for better visibility.
- **Vite Configuration**: Added base path `/KiKat/` for GitHub Pages deployment.

## [1.0.1] - 2026-06-16

### Fixed
- **Mobile UI**: Added hamburger menu button to open sidebar on Android/mobile screens, and close button within the sidebar.


## [1.0.0] - 2026-06-14

### Added
- **Core Architecture**: Initialized React & Vite setup with Vanilla CSS custom design system.
- **Database & Security**: Configured IndexedDB for local data persistence (`db.js`) and Web Crypto API encryption (`crypto.js`) to secure Gemini API keys.
- **AI Integration**: Implemented Gemini client (`gemini.js`) with support for dynamic template assembly, multimodal inputs (Base64 vision queries), and JSON output schema enforcement.
- **Report Exporting**: Integrated PDF generation (`pdf.js`) using `jspdf` to export structured results.
- **Default Seeds**: Seeded default `Song-Analyse` and `Bild-Analyse` categories on first-time app initialization.
