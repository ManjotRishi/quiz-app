import './loadBackendEnv.js';
import admin from 'firebase-admin';

let firestoreDb;

const normalizeServiceAccountEnv = (value) => {
  if (!value || typeof value !== 'string') {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT env');
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Empty FIREBASE_SERVICE_ACCOUNT env');
  }

  if (trimmed.startsWith('{')) {
    return trimmed.replace(
      /"private_key"\s*:\s*"([\s\S]*?)"/,
      (_, privateKey) => `"private_key":"${privateKey.replace(/\r?\n/g, '\\n')}"`
    );
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return normalizeServiceAccountEnv(trimmed.slice(1, -1));
  }

  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8').trim();

    if (decoded.startsWith('{')) {
      return normalizeServiceAccountEnv(decoded);
    }
  } catch (error) {
    console.warn('FIREBASE_SERVICE_ACCOUNT base64 decode failed:', error?.message ?? error);
  }

  throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON or base64 JSON');
};

const getFirebaseServiceAccount = () => {
  const normalizedValue = normalizeServiceAccountEnv(process.env.FIREBASE_SERVICE_ACCOUNT);
  const serviceAccount = JSON.parse(normalizedValue);

  if (typeof serviceAccount?.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
};

export const getFirestoreDb = () => {
  if (!firestoreDb) {
    if (!admin.apps.length) {
      const serviceAccount = getFirebaseServiceAccount();

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    firestoreDb = admin.firestore();
  }

  return firestoreDb;
};
