class Tutor {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.description = row.description;
    this.gender = row.gender;
    this.photoUrl = row.photo_url;
    this.rivUrl = row.riv_url;
    this.voiceId = row.voice_id;
    this.nativeLang = row.native_lang;
    this.tagline = row.tagline ?? null;
    this.sortOrder = row.sort_order ?? 0;
    this.isActive = row.is_active === 1 || row.is_active === true;
  }

  toJSON({ includeInactive = false } = {}) {
    const base = {
      id: this.id,
      name: this.name,
      description: this.description,
      gender: this.gender,
      photoUrl: this.photoUrl,
      rivUrl: this.rivUrl,
      voiceId: this.voiceId,
      nativeLang: this.nativeLang,
      tagline: this.tagline,
      sortOrder: this.sortOrder,
    };
    if (includeInactive) {
      base.isActive = this.isActive;
    }
    return base;
  }
}

module.exports = Tutor;
