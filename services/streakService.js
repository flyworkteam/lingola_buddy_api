const StreakRepository = require('../repositories/StreakRepository');
const { localTodayString } = require('../utils/clientTimezone');

class StreakService {
  static async getMyStreak(userId, timezoneOffsetMinutes = 0) {
    return StreakRepository.getStreakDashboard(userId, timezoneOffsetMinutes);
  }

  static async recordPractice(
    userId,
    { minutes = 0, wordsLearned = 0, accuracyPercent = null, timezoneOffsetMinutes = 0 } = {}
  ) {
    const todayStr = localTodayString(timezoneOffsetMinutes);
    await StreakRepository.recordPracticeDay(userId, todayStr, {
      minutes,
      wordsLearned,
      accuracyPercent,
    });
    return StreakRepository.getStreakDashboard(userId, timezoneOffsetMinutes);
  }
}

module.exports = StreakService;
