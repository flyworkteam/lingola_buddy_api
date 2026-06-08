const Tutor = require('../models/Tutor');
const TutorRepository = require('../repositories/TutorRepository');
const TutorTranslationRepository = require('../repositories/TutorTranslationRepository');
const BunnyCDNService = require('./bunnyCDNService');
const {
  normalizeTutorId,
  buildDefaultAssetUrls,
  resolveLocale,
  SUPPORTED_LOCALES,
} = require('../utils/tutorAssets');

class TutorService {
  static _applyTranslation(row, translation) {
    if (!translation) return row;
    return {
      ...row,
      name: translation.display_name || row.name,
      description: translation.description || row.description,
      tagline: translation.tagline ?? row.tagline,
    };
  }

  static async _localizedRows(rows, locale) {
    const ids = rows.map((r) => r.id);
    const map = await TutorTranslationRepository.findForTutorIds(ids, locale);
    const enMap =
      locale === 'en'
        ? map
        : await TutorTranslationRepository.findForTutorIds(ids, 'en');
    return rows.map((row) => {
      const translation = map.get(row.id) || enMap.get(row.id);
      return this._applyTranslation(row, translation);
    });
  }

  static async listActiveTutors(locale = 'en') {
    const loc = resolveLocale(locale);
    const rows = await TutorRepository.findAllActive();
    const localized = await this._localizedRows(rows, loc);
    return localized.map((row) => new Tutor(row));
  }

  static async getTutorById(id, locale = 'en') {
    const row = await TutorRepository.findById(id);
    if (!row) return null;
    const loc = resolveLocale(locale);
    const [localized] = await this._localizedRows([row], loc);
    return new Tutor(localized);
  }

  /** Panel — tüm tutorlar (pasif dahil) */
  static async listAllForPanel() {
    const rows = await TutorRepository.findAll({ includeInactive: true });
    const out = [];
    for (const row of rows) {
      const translations = await TutorTranslationRepository.findAllForTutor(row.id);
      out.push({ tutor: new Tutor(row), translations });
    }
    return out;
  }

  static async getForPanel(id) {
    const row = await TutorRepository.findById(id, { includeInactive: true });
    if (!row) return null;
    const translations = await TutorTranslationRepository.findAllForTutor(id);
    return { tutor: new Tutor(row), translations };
  }

  static _validateCreateBody(body) {
    const id = normalizeTutorId(body.id);
    const name = String(body.name || '').trim();
    const gender = String(body.gender || '').toLowerCase();
    const voiceId = String(body.voiceId || '').trim();
    const description = String(body.description || '').trim();

    if (!name) throw new Error('name is required');
    if (!['female', 'male'].includes(gender)) throw new Error('gender must be female or male');
    if (!voiceId) throw new Error('voiceId is required');
    if (!description) throw new Error('description is required (default/fallback bio)');

    const assets = buildDefaultAssetUrls(id, name);
    return {
      id,
      name,
      description,
      gender,
      voice_id: voiceId,
      native_lang: String(body.nativeLang || 'en').trim() || 'en',
      tagline: body.tagline != null ? String(body.tagline).trim() : null,
      sort_order: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      is_active: body.isActive === false ? 0 : 1,
      photo_url: String(body.photoUrl || assets.photoUrl).trim(),
      riv_url: String(body.rivUrl || assets.rivUrl).trim(),
      cdnFolder: body.cdnFolder || assets.cdnFolder,
    };
  }

  static async createFromPanel(body) {
    const row = this._validateCreateBody(body);
    const existing = await TutorRepository.findById(row.id, { includeInactive: true });
    if (existing) throw new Error('Tutor id already exists');

    await TutorRepository.create(row);
    if (body.translations) {
      await TutorTranslationRepository.upsertMany(row.id, body.translations);
    }

    return this.getForPanel(row.id);
  }

  static async updateFromPanel(id, body) {
    const tutorId = normalizeTutorId(id);
    const existing = await TutorRepository.findById(tutorId, { includeInactive: true });
    if (!existing) throw new Error('Tutor not found');

    const patch = {};
    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.description !== undefined) patch.description = String(body.description).trim();
    if (body.gender !== undefined) {
      const g = String(body.gender).toLowerCase();
      if (!['female', 'male'].includes(g)) throw new Error('gender must be female or male');
      patch.gender = g;
    }
    if (body.voiceId !== undefined) patch.voiceId = String(body.voiceId).trim();
    if (body.nativeLang !== undefined) patch.nativeLang = String(body.nativeLang).trim();
    if (body.tagline !== undefined) patch.tagline = body.tagline == null ? null : String(body.tagline).trim();
    if (body.sortOrder !== undefined) patch.sortOrder = Number(body.sortOrder);
    if (body.isActive !== undefined) patch.isActive = body.isActive ? 1 : 0;
    if (body.photoUrl !== undefined) patch.photoUrl = String(body.photoUrl).trim();
    if (body.rivUrl !== undefined) patch.rivUrl = String(body.rivUrl).trim();

    await TutorRepository.update(tutorId, patch);
    if (body.translations) {
      await TutorTranslationRepository.upsertMany(tutorId, body.translations);
    }

    return this.getForPanel(tutorId);
  }

  static async deactivate(id) {
    const tutorId = normalizeTutorId(id);
    const existing = await TutorRepository.findById(tutorId, { includeInactive: true });
    if (!existing) throw new Error('Tutor not found');
    await TutorRepository.softDelete(tutorId);
    return this.getForPanel(tutorId);
  }

  static async uploadAsset(id, buffer, originalName, type) {
    const tutorId = normalizeTutorId(id);
    const row = await TutorRepository.findById(tutorId, { includeInactive: true });
    if (!row) throw new Error('Tutor not found');

    const folder = bodyFolder(row);
    const url = await BunnyCDNService.uploadTutorAsset({
      folder,
      tutorId,
      fileBuffer: buffer,
      originalName,
      assetType: type,
    });

    const patch = type === 'photo' ? { photoUrl: url } : { rivUrl: url };
    await TutorRepository.update(tutorId, patch);
    return this.getForPanel(tutorId);
  }

  static supportedLocales() {
    return [...SUPPORTED_LOCALES];
  }
}

function bodyFolder(row) {
  const name = row.name || row.id;
  return name[0].toUpperCase() + name.slice(1);
}

module.exports = TutorService;
