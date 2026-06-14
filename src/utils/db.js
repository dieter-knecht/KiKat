const DB_NAME = 'kikat_db';
const DB_VERSION = 1;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
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
    return getStore('categories', 'readwrite').then((store) => {
      return new Promise((resolve, reject) => {
        const req = store.add(category);
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
