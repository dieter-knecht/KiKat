# KiKat Project Rules & Specifications

This workspace represents the **KiKat** project, a React-based Progressive Web App (PWA) built with Vite for managing and executing structured, repeatable AI queries using the Gemini API.

## Project Scope & Tech Stack
- **Framework**: React 19, Vite, TailwindCSS (configured via CSS variables/vanilla CSS styles in `src/index.css` and `src/App.css`).
- **PWA**: PWA support enabled via `vite-plugin-pwa`.
- **Database**: IndexedDB (`kikat_db`) via `src/utils/db.js` storing categories, history, and settings.
- **AI Integration**: Custom direct client-side integration with Google's Gemini API via `src/utils/gemini.js`.
- **Crypto**: Local encryption of API keys via `src/utils/crypto.js`.
- **PDF Export**: PDF generation capability using `jspdf` via `src/utils/pdf.js`.

## Coding Guidelines
1. **Components**: The main logic is currently defined in `src/App.jsx`. Keep styling clean, modern, and aligned with the custom dark slate design.
2. **IndexedDB Stores**:
   - `categories`: Contains defined template configurations.
   - `history`: Query history entries with timestamp, inputs, and outputs.
   - `settings`: App configuration keys (e.g. API keys, theme, export paths).
3. **API Keys**: Always use `dbService` + `encryptData`/`decryptData` when dealing with credentials. Never store API keys in plain text.
4. **Localization**: Maintain supporting strings in the `TRANSLATIONS` map in `App.jsx` (supports `de` and `en`).

## Common Developer Commands
- Run development server: `npm run dev`
- Build project: `npm run build`
- Run linting: `npm run lint`
