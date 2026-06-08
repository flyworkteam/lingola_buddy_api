const UserRepository = require('../repositories/UserRepository');
const User = require('../models/User');
const { createLogger } = require('../utils/logger');
const { generateGuestEmail } = require('../utils/guestEmail');

const log = createLogger('USER');

class UserService {
  static async findOrCreateUser(providerData, credential) {
    const existing = await UserRepository.findByCredential(credential, providerData.id);

    if (existing) {
      const userData = UserRepository.mapRowToUser(existing);
      const updates = {};
      const cred = userData.credentialData || {};

      if (providerData.picture && providerData.picture !== userData.profilePhotoUrl) {
        updates.profilePhotoUrl = providerData.picture;
      }
      if (credential === 'guest' && userData.username !== 'Guest user') {
        updates.username = 'Guest user';
      } else if (providerData.name && (!userData.username || userData.username === 'Lingola User')) {
        updates.username = providerData.name;
      }

      if (credential === 'guest' && !cred.email) {
        updates.credentialData = {
          ...cred,
          email: generateGuestEmail(),
        };
      }

      if (Object.keys(updates).length > 0) {
        const updated = await UserRepository.update(existing.id, updates);
        return new User(UserRepository.mapRowToUser(updated));
      }
      return new User(userData);
    }

    const username =
      credential === 'guest'
        ? 'Guest user'
        : providerData.name?.trim() || 'Lingola User';

    const guestEmail =
      credential === 'guest' ? generateGuestEmail() : providerData.email;

    const created = await UserRepository.create({
      credential,
      credentialData: {
        providerId: providerData.providerId,
        email: guestEmail,
        id: providerData.id,
      },
      username,
      profilePhotoUrl: providerData.picture ?? null,
      accountCreatedDate: new Date(),
    });

    return new User(UserRepository.mapRowToUser(created));
  }

  static async getUserById(userId) {
    const row = await UserRepository.findById(userId);
    return row ? new User(UserRepository.mapRowToUser(row)) : null;
  }

  static async updateUser(userId, updateData) {
    const updated = await UserRepository.update(userId, updateData);
    if (!updated) throw new Error('User not found');
    return new User(UserRepository.mapRowToUser(updated));
  }

  static async deleteUserAccount(userId) {
    const TokenRepository = require('../repositories/TokenRepository');
    try {
      await TokenRepository.revokeAll(userId);
      const deleted = await UserRepository.delete(userId);
      if (!deleted) {
        throw new Error('User not found');
      }
      log.info(`Account deleted userId=${userId}`);
      return true;
    } catch (error) {
      log.error(`deleteUserAccount failed userId=${userId}`, error);
      throw error;
    }
  }
}

module.exports = UserService;
