class User {
  constructor(data) {
    this.id = data.id;
    this.credential = data.credential;
    this.credentialData = data.credentialData;
    this.username = data.username;
    this.nativeLang = data.nativeLang ?? null;
    this.profilePhotoUrl = data.profilePhotoUrl ?? null;
    this.learnLanguageCode = data.learnLanguageCode ?? null;
    this.proficiency = data.proficiency ?? null;
    this.dailyGoal = data.dailyGoal ?? null;
    this.currentLessonId = data.current_lesson_id ?? data.currentLessonId ?? null;
    this.accountCreatedDate = data.accountCreatedDate ?? new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      credential: this.credential,
      credentialData: this.credentialData,
      username: this.username,
      nativeLang: this.nativeLang,
      profilePhotoUrl: this.profilePhotoUrl,
      learnLanguageCode: this.learnLanguageCode,
      proficiency: this.proficiency,
      dailyGoal: this.dailyGoal,
      currentLessonId: this.currentLessonId,
      accountCreatedDate: this.accountCreatedDate,
    };
  }
}

module.exports = User;
