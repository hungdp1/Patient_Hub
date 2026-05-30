import crypto from 'crypto';

const IV_LENGTH = 16;

const DEFAULT_DEV_ENCRYPTION_KEY = '00000000000000000000000000000000';
const rawEncryptionKey = process.env.CREDIT_CARD_ENCRYPTION_KEY?.trim();
const isProduction = process.env.NODE_ENV === 'production';
let ENCRYPTION_KEY = DEFAULT_DEV_ENCRYPTION_KEY;

if (rawEncryptionKey && rawEncryptionKey.length === 32) {
  ENCRYPTION_KEY = rawEncryptionKey;
} else if (isProduction) {
  throw new Error(
    'Missing or invalid CREDIT_CARD_ENCRYPTION_KEY. It must be 32 characters long.',
  );
} else if (rawEncryptionKey) {
  console.warn(
    'WARNING: CREDIT_CARD_ENCRYPTION_KEY is invalid. Using default development key.',
  );
}

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    'Missing or invalid CREDIT_CARD_ENCRYPTION_KEY. It must be 32 characters long.',
  );
}

export const encryptAES256 = (value: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'utf8'),
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptAES256 = (value: string): string => {
  const [ivHex, encryptedHex] = value.split(':');

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted payload');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'utf8'),
    iv,
  );

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};
