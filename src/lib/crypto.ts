// Utility for encrypting and decrypting local storage data 
// using Native Web Crypto API to avoid external dependencies like crypto-js.

const ENCRYPTION_KEY = 'TechBoard-Secure-Local-Storage-Key-2024';

const getDerivedKey = async (): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('TechBoardSalt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export async function encryptData(text: string): Promise<string> {
  try {
    const key = await getDerivedKey();
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipher = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(text)
    );
    
    // Combine IV + Cipher to a single base64 string
    const cipherArray = Array.from(new Uint8Array(cipher));
    const ivArray = Array.from(iv);
    const combined = [...ivArray, ...cipherArray];
    return btoa(String.fromCharCode.apply(null, combined));
  } catch (error) {
    console.error('Encryption failed', error);
    return '';
  }
}

export async function decryptData(encryptedBase64: string): Promise<string> {
  try {
    const key = await getDerivedKey();
    const dec = new TextDecoder();
    const combinedStr = atob(encryptedBase64);
    const combinedArray = new Uint8Array(combinedStr.length);
    for (let i = 0; i < combinedStr.length; i++) {
        combinedArray[i] = combinedStr.charCodeAt(i);
    }
    
    // Extract IV (first 12 bytes) and Cipher
    const iv = combinedArray.slice(0, 12);
    const cipher = combinedArray.slice(12);
    
    const decryptedOutput = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
    );
    return dec.decode(decryptedOutput);
  } catch (error) {
    console.error('Decryption failed', error);
    return '';
  }
}
