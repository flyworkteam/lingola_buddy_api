/**
 * Firebase ID token verification for Google / Apple sign-in (client uses Firebase Auth).
 */

const { initFirebaseAdmin, isFirebaseReady, getAdmin } = require('../config/firebase');

class AuthService {
  static _credentialFromFirebaseProvider(signInProvider) {
    if (signInProvider === 'google.com') return 'google';
    if (signInProvider === 'apple.com') return 'apple';
    throw new Error(`Unsupported Firebase sign-in provider: ${signInProvider}`);
  }

  /**
   * @param {string} idToken - Firebase ID token from client
   * @returns {Promise<{ providerId: string, email: string|null, name: string|null, picture: string|null, id: string }>}
   */
  static async verifyFirebaseIdToken(idToken) {
    initFirebaseAdmin();
    if (!isFirebaseReady()) {
      throw new Error(
        'Firebase Admin yapılandırılmadı. lingola_apis/firebase-service-account.json dosyasını kontrol edin.'
      );
    }

    const decoded = await getAdmin().auth().verifyIdToken(idToken);
    const signInProvider = decoded.firebase?.sign_in_provider;
    if (!signInProvider) {
      throw new Error('Invalid Firebase token: missing sign_in_provider');
    }

    const credential = this._credentialFromFirebaseProvider(signInProvider);

    return {
      providerId: credential,
      email: decoded.email || null,
      name: decoded.name || decoded.email?.split('@')[0] || 'Lingola User',
      picture: decoded.picture || null,
      id: decoded.uid,
    };
  }
}

module.exports = AuthService;
