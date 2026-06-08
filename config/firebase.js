const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { createLogger } = require('../utils/logger');

const log = createLogger('FIREBASE');

let initialized = false;

const DEFAULT_CREDENTIAL_FILE = path.join(
  __dirname,
  '..',
  'firebase-service-account.json'
);

function initFirebaseAdmin() {
  if (initialized) return admin;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let credentialPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!json && !credentialPath && fs.existsSync(DEFAULT_CREDENTIAL_FILE)) {
    credentialPath = DEFAULT_CREDENTIAL_FILE;
  }

  try {
    if (json) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(json)),
      });
    } else if (credentialPath) {
      const resolved = path.isAbsolute(credentialPath)
        ? credentialPath
        : path.resolve(process.cwd(), credentialPath);
      if (!fs.existsSync(resolved)) {
        throw new Error(`Service account file not found: ${resolved}`);
      }
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const serviceAccount = require(resolved);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      log.warn(
        'Firebase Admin yapılandırılmadı. lingola_apis/firebase-service-account.json ' +
          'ekleyin veya FIREBASE_SERVICE_ACCOUNT_PATH tanımlayın.'
      );
      return null;
    }

    initialized = true;
    log.info('Firebase Admin initialized');
    return admin;
  } catch (err) {
    log.error('Firebase Admin init failed', err.message);
    return null;
  }
}

function isFirebaseReady() {
  initFirebaseAdmin();
  return initialized && admin.apps.length > 0;
}

module.exports = { initFirebaseAdmin, isFirebaseReady, getAdmin: () => admin };
