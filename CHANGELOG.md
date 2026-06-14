# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-14

### Added
- **Core Architecture**: Initialized React & Vite setup with Vanilla CSS custom design system.
- **Database & Security**: Configured IndexedDB for local data persistence (`db.js`) and Web Crypto API encryption (`crypto.js`) to secure Gemini API keys.
- **AI Integration**: Implemented Gemini client (`gemini.js`) with support for dynamic template assembly, multimodal inputs (Base64 vision queries), and JSON output schema enforcement.
- **Report Exporting**: Integrated PDF generation (`pdf.js`) using `jspdf` to export structured results.
- **Default Seeds**: Seeded default `Song-Analyse` and `Bild-Analyse` categories on first-time app initialization.
