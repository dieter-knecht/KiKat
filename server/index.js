/* eslint-disable */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const FILE_PATH = path.join(__dirname, 'library.json');

// Initialize library file with empty array if it doesn't exist
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint: GET /api/categories or GET /api/categories/
  if (req.method === 'GET' && (url.pathname === '/api/categories' || url.pathname === '/api/categories/')) {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read database file' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  // Endpoint: POST /api/categories or POST /api/categories/
  if (req.method === 'POST' && (url.pathname === '/api/categories' || url.pathname === '/api/categories/')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        if (!data || !data.name || !data.version) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid category data. Name and version are required.' }));
          return;
        }

        fs.readFile(FILE_PATH, 'utf8', (err, fileData) => {
          let library = [];
          if (!err) {
            try {
              library = JSON.parse(fileData);
            } catch (e) {
              library = [];
            }
          }

          const name = data.name;
          const version = data.version;
          const libraryKey = data.libraryKey || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

          // Find if category already exists in library
          let catIndex = library.findIndex(cat => cat.libraryKey === libraryKey);

          const newVersion = {
            version: version,
            description: data.description || '',
            fields: data.fields || [],
            template: data.template || '',
            outputSections: data.outputSections || [],
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            changelog: data.changelog || ''
          };

          if (catIndex !== -1) {
            library[catIndex].name = name;
            library[catIndex].description = data.description || library[catIndex].description;
            library[catIndex].latestVersion = version;
            library[catIndex].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

            if (!Array.isArray(library[catIndex].versions)) {
              library[catIndex].versions = [];
            }

            // If version already exists in history, overwrite, else append
            const vIdx = library[catIndex].versions.findIndex(v => v.version === version);
            if (vIdx !== -1) {
              library[catIndex].versions[vIdx] = newVersion;
            } else {
              library[catIndex].versions.push(newVersion);
            }
          } else {
            library.push({
              libraryKey: libraryKey,
              name: name,
              description: data.description || '',
              latestVersion: version,
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              versions: [newVersion]
            });
          }

          fs.writeFile(FILE_PATH, JSON.stringify(library, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save to database file' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Category published successfully.' }));
          });
        });
      } catch (parseErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`KiKat central library companion server running on port ${PORT}`);
});
