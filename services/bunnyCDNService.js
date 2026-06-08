const axios = require('axios');
const path = require('path');
const { createLogger } = require('../utils/logger');

const log = createLogger('BUNNY-CDN');

class BunnyCDNService {
  static async uploadFile(fileBuffer, fileName, fileType = 'image') {
    const storageZoneName = process.env.BUNNY_CDN_STORAGE_ZONE || '';
    const storageZonePassword = process.env.BUNNY_CDN_STORAGE_PASSWORD || '';
    const cdnHostname = process.env.BUNNY_CDN_HOSTNAME || '';

    if (!storageZoneName || !storageZonePassword || !cdnHostname) {
      throw new Error('Bunny CDN configuration is missing.');
    }

    const folder = fileType === 'voice' ? 'voices' : 'images';
    const ext = path.extname(fileName);
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const cdnPath = `${folder}/${uniqueFileName}`;
    const uploadUrl = `https://storage.bunnycdn.com/${storageZoneName}/${cdnPath}`;

    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        AccessKey: storageZonePassword,
        'Content-Type': this.getContentType(fileName, fileType),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    if (response.status === 201 || response.status === 200) {
      const host = cdnHostname.replace(/^https?:\/\//, '');
      const url = `https://${host}/${cdnPath}`;
      log.info(`Upload OK: ${cdnPath}`);
      return url;
    }

    log.error(`Upload failed with status ${response.status}`, cdnPath);
    throw new Error(`Bunny CDN upload failed. Status: ${response.status}`);
  }

  /**
   * Tutor Buddies klasörü — örn. Buddies/Aria/c_aria.png
   */
  static async uploadTutorAsset({ folder, tutorId, fileBuffer, originalName, assetType }) {
    const storageZoneName = process.env.BUNNY_CDN_STORAGE_ZONE || '';
    const storageZonePassword = process.env.BUNNY_CDN_STORAGE_PASSWORD || '';
    const cdnHostname = process.env.BUNNY_CDN_HOSTNAME || '';

    if (!storageZoneName || !storageZonePassword || !cdnHostname) {
      throw new Error('Bunny CDN configuration is missing.');
    }

    const ext = assetType === 'riv' ? '.riv' : path.extname(originalName).toLowerCase() || '.png';
    const fileName = `c_${tutorId}${ext}`;
    const cdnPath = `Buddies/${folder}/${fileName}`;
    const uploadUrl = `https://storage.bunnycdn.com/${storageZoneName}/${cdnPath}`;

    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        AccessKey: storageZonePassword,
        'Content-Type':
          assetType === 'riv'
            ? 'application/octet-stream'
            : this.getContentType(fileName, 'image'),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    if (response.status === 201 || response.status === 200) {
      const host = cdnHostname.replace(/^https?:\/\//, '');
      const url = `https://${host}/${cdnPath}`;
      log.info(`Tutor asset OK: ${cdnPath}`);
      return url;
    }

    throw new Error(`Bunny CDN upload failed. Status: ${response.status}`);
  }

  static getContentType(fileName, fileType) {
    const ext = path.extname(fileName).toLowerCase();
    if (fileType === 'voice') {
      const voiceTypes = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
      };
      return voiceTypes[ext] || 'audio/mpeg';
    }

    const imageTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return imageTypes[ext] || 'image/jpeg';
  }
}

module.exports = BunnyCDNService;
