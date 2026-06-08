const router = require('express').Router();
const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const BunnyCDNService = require('../services/bunnyCDNService');
const upload = require('../middleware/upload');
const { isFirebaseReady, getAdmin } = require('../config/firebase');
const { generateToken, decodeToken } = require('../utils/jwt');
const TokenRepository = require('../repositories/TokenRepository');
const { authenticate } = require('../middleware/auth');
const UserRepository = require('../repositories/UserRepository');
const LessonService = require('../services/lessonService');
const { createLogger } = require('../utils/logger');

const log = createLogger('AUTH');

async function issueAuthResponse(req, res, user, message) {
  const token = generateToken(user.id, { expiresIn: '30d' });
  const decoded = decodeToken(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await TokenRepository.create(user.id, token, expiresAt, {
    deviceInfo: req.headers['user-agent'] || null,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
  });

  res.status(200).json({
    success: true,
    data: { user: user.toJSON(), token },
    message,
  });
}

/**
 * POST /auth/firebase
 * Body: { idToken: string } — Firebase ID token after Google/Apple sign-in
 */
router.post('/firebase', async (req, res, next) => {
  try {
    const idToken = req.body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ success: false, error: 'idToken is required' });
    }

    const providerData = await AuthService.verifyFirebaseIdToken(idToken);
    const credential = providerData.providerId;
    const user = await UserService.findOrCreateUser(providerData, credential);

    if (!user) {
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }

    await issueAuthResponse(req, res, user, 'User authenticated successfully');
  } catch (error) {
    log.error('Firebase auth error', error);
    next(error);
  }
});

/**
 * POST /auth/guest
 * Body: { deviceId: string } — stable per-device id (not Firebase)
 * Same deviceId returns same guest until account is deleted.
 */
router.post('/guest', async (req, res, next) => {
  try {
    const deviceId = req.body?.deviceId;
    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'deviceId is required (min 8 characters)',
      });
    }

    const guestId = deviceId.trim();
    const existingUser = await UserRepository.findByCredential('guest', guestId);
    const isNewUser = !existingUser;

    const guestProviderData = {
      providerId: 'guest',
      id: guestId,
      name: null,
      picture: null,
    };

    const user = await UserService.findOrCreateUser(guestProviderData, 'guest');
    if (!user) {
      return res.status(500).json({ success: false, error: 'Failed to create guest user' });
    }

    const message = isNewUser
      ? 'Guest user created and authenticated successfully'
      : 'Guest user authenticated successfully';

    await issueAuthResponse(req, res, user, message);
  } catch (error) {
    log.error('Guest auth error', error);
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await TokenRepository.revoke(token);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toJSON() },
  });
});

router.post('/profile/photo', authenticate, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Photo file is required' });
    }

    const cdnUrl = await BunnyCDNService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      'image'
    );

    const updatedUser = await UserService.updateUser(req.userId, {
      profilePhotoUrl: cdnUrl,
    });

    res.status(200).json({
      success: true,
      data: { user: updatedUser.toJSON(), photoUrl: cdnUrl },
      message: 'Profile photo updated successfully',
    });
  } catch (error) {
    log.error('Profile photo upload error', error);
    next(error);
  }
});

router.delete('/profile/photo', authenticate, async (req, res, next) => {
  try {
    const updatedUser = await UserService.updateUser(req.userId, {
      profilePhotoUrl: null,
    });
    res.status(200).json({
      success: true,
      data: { user: updatedUser.toJSON() },
      message: 'Profile photo removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { username, nativeLang, profilePhotoUrl, learnLanguageCode, proficiency, dailyGoal } =
      req.body;

    const updateData = {};
    if (username !== undefined) {
      updateData.username =
        typeof username === 'string' && username.trim().length > 0
          ? username.trim()
          : 'Lingola User';
    }
    if (nativeLang !== undefined) updateData.nativeLang = nativeLang;
    if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl;
    if (learnLanguageCode !== undefined) updateData.learnLanguageCode = learnLanguageCode;
    if (proficiency !== undefined) updateData.proficiency = proficiency;
    if (dailyGoal !== undefined) updateData.dailyGoal = dailyGoal;

    const updatedUser = await UserService.updateUser(req.userId, updateData);

    if (proficiency !== undefined) {
      try {
        await LessonService.ensureUserProgress(req.userId, proficiency);
      } catch (e) {
        log.warn('Lesson progress init failed', e.message);
      }
    }

    res.status(200).json({
      success: true,
      data: { user: updatedUser.toJSON() },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/account', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const credential = user.credential;
    const firebaseUid = user.credentialData?.id;

    await UserService.deleteUserAccount(req.userId);

    if (
      (credential === 'google' || credential === 'apple') &&
      firebaseUid &&
      isFirebaseReady()
    ) {
      try {
        await getAdmin().auth().deleteUser(firebaseUid);
      } catch (firebaseErr) {
        log.warn('Firebase Auth user delete failed (DB already removed)', firebaseErr.message);
      }
    }

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
