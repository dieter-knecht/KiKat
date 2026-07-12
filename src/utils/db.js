const DB_NAME = 'kikat_db';
const DB_VERSION = 2;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const oldVersion = e.oldVersion;

      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      if (oldVersion < 2) {
        // Migration of existing categories to include version, libraryKey, and isCustomized fields
        const transaction = e.target.transaction;
        if (transaction) {
          const store = transaction.objectStore('categories');
          store.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const category = cursor.value;
              let updated = false;
              if (category.version === undefined) {
                category.version = '1.0.0';
                updated = true;
              }
              if (category.libraryKey === undefined) {
                // Generate a stable key/slug based on name
                category.libraryKey = (category.name || '')
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, '-');
                updated = true;
              }
              if (category.isCustomized === undefined) {
                category.isCustomized = false;
                updated = true;
              }
              if (updated) {
                cursor.update(category);
              }
              cursor.continue();
            }
          };
        }
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function getStore(storeName, mode = 'readonly') {
  return initDB().then((db) => {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  });
}

export const dbService = {
  // Categories API
  getAllCategories() {
    return getStore('categories').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  getCategory(id) {
    return getStore('categories').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  addCategory(category) {
    const slug = (category.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');
    const enriched = {
      version: '1.0.0',
      libraryKey: slug || `cat-${Date.now()}`,
      isCustomized: false,
      ...category
    };
    return getStore('categories', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.add(enriched);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  updateCategory(category) {
    return getStore('categories', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.put(category);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  deleteCategory(id) {
    return getStore('categories', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  // History API
  getHistory(categoryId) {
    return getStore('history').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result;
          if (categoryId) {
            resolve(list.filter(item => item.categoryId === categoryId).sort((a, b) => b.timestamp - a.timestamp));
          } else {
            resolve(list.sort((a, b) => b.timestamp - a.timestamp));
          }
        };
        req.onerror = () => reject(req.error);
      });
    });
  },

  addHistoryEntry(entry) {
    return getStore('history', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.add({
          ...entry,
          timestamp: Date.now()
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  deleteHistoryEntry(id) {
    return getStore('history', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  },

  // Settings API
  getSetting(key, defaultValue = null) {
    return getStore('settings').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result ? req.result.value : defaultValue);
        };
        req.onerror = () => reject(req.error);
      });
    });
  },

  saveSetting(key, value) {
    return getStore('settings', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.put({ key, value });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }
};
