/**
 * Criptografia para o Cofre de Acessos.
 * IMPORTANTE: Configure ENCRYPTION_KEY no .env antes de usar em produção.
 * Gere uma chave com: openssl rand -hex 32
 */

const ALGORITHM = "AES-GCM";

function getKeyMaterial(key: string): Uint8Array {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key.padEnd(32, "0").slice(0, 32));
  return keyBytes;
}

async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", rawKey.buffer as ArrayBuffer, { name: ALGORITHM }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encrypt(text: string): Promise<string> {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    return Buffer.from(text).toString("base64");
  }

  const keyMaterial = getKeyMaterial(encryptionKey);
  const key = await importKey(keyMaterial);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(text)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return Buffer.from(combined).toString("base64");
}

export async function decrypt(encryptedText: string): Promise<string> {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    return Buffer.from(encryptedText, "base64").toString("utf-8");
  }

  const keyMaterial = getKeyMaterial(encryptionKey);
  const key = await importKey(keyMaterial);
  const combined = Buffer.from(encryptedText, "base64");
  const iv = combined.subarray(0, 12);
  const encryptedData = combined.subarray(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decrypted);
}
