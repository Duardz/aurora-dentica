import CryptoJS from 'crypto-js';

// Get encryption key from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'aurora-dentica-default-key-2024';

/**
 * Encrypt sensitive data before storing in Firestore
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
}

/**
 * Decrypt data retrieved from Firestore
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedText; // Return original if decryption fails
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields<T extends Record<string, any>>(
  data: T, 
  fieldsToEncrypt: (keyof T)[]
): T {
  const encrypted = { ...data };
  
  fieldsToEncrypt.forEach(field => {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field] as string) as T[keyof T];
    }
  });
  
  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields<T extends Record<string, any>>(
  data: T, 
  fieldsToDecrypt: (keyof T)[]
): T {
  const decrypted = { ...data };
  
  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decrypt(decrypted[field] as string) as T[keyof T];
    }
  });
  
  return decrypted;
}