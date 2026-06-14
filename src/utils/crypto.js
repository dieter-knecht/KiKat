async function getOrCreateKey() {
  let key = localStorage.getItem('kikat_crypto_key');
  if (!key) {
    const rawKey = window.crypto.getRandomValues(new Uint8Array(16));
    key = btoa(String.fromCharCode(...rawKey));
    localStorage.setItem('kikat_crypto_key', key);
  }
  const keyBuf = new Uint8Array(atob(key).split('').map(c => c.charCodeAt(0)));
  return await window.crypto.subtle.importKey(
    'raw',
    keyBuf,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(text) {
  if (!text) return '';
  try {
    const key = await getOrCreateKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error('Encryption failed', err);
    return '';
  }
}

export async function decryptData(cipherText) {
  if (!cipherText) return '';
  try {
    const key = await getOrCreateKey();
    const combined = new Uint8Array(atob(cipherText).split('').map(c => c.charCodeAt(0)));
    if (combined.length <= 12) return '';
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error('Decryption failed', err);
    return '';
  }
}
