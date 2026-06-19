# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
