import crypto from 'crypto';
import { log } from '@/lib/log';

/**
 * AES-256-GCM encryption-at-rest for stored secrets (assessment R7/TD11).
 * Key comes from APP_ENCRYPTION_KEY (32+ char string). Ciphertext format:
 * enc:v1:<iv b64>:<tag b64>:<data b64>
 */
const PREFIX = 'enc:v1:';

function key(): Buffer | null {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) return null;
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptionAvailable(): boolean {
  return key() !== null;
}

export function encryptSecret(plain: string): string {
  const k = key();
  if (!k) {
    log.warn('APP_ENCRYPTION_KEY not set - storing secret unencrypted is refused');
    throw new Error('APP_ENCRYPTION_KEY is not configured');
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', k, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + [iv.toString('base64'), tag.toString('base64'), data.toString('base64')].join(':');
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext
  const k = key();
  if (!k) throw new Error('APP_ENCRYPTION_KEY is not configured');
  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', k, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
}
