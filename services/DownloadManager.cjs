const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { nativeImage } = require('electron');

class DownloadManager {
  constructor(app, orchestrator) {
    this.app = app;
    this.orchestrator = orchestrator;
    this._thumbDirHidden = false;
  }

  getThumbnailDir() {
    const baseDir = this.orchestrator.settingsManager.getMediaFolder();
    const thumbDir = path.join(baseDir, '.thumbnails');
    if (!fs.existsSync(thumbDir)) {
      try {
        fs.mkdirSync(thumbDir, { recursive: true });
        if (process.platform === 'win32') {
          exec(`attrib +h "${thumbDir}"`);
        }
      } catch (e) {}
    } else if (process.platform === 'win32' && !this._thumbDirHidden) {
      this._thumbDirHidden = true;
      exec(`attrib +h "${thumbDir}"`);
    }
    return thumbDir;
  }

  getThumbnailPath(sourceFilePath) {
    const hash = crypto.createHash('md5').update(sourceFilePath).digest('hex');
    return path.join(this.getThumbnailDir(), `${hash}.jpg`);
  }

  async generateThumbnailBuffer(absolutePath, nativeImg) {
    try {
      const ext = path.extname(absolutePath).toLowerCase();
      const nImg = nativeImg || nativeImage;
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(ext)) {
        let image = nImg.createFromPath(absolutePath);
        if (!image.isEmpty()) {
          const size = image.getSize();
          if (size.width > 300 || size.height > 300) {
            if (size.width >= size.height) {
              image = image.resize({ width: 300, quality: 'good' });
            } else {
              image = image.resize({ height: 300, quality: 'good' });
            }
          }
          return image.toJPEG(80);
        }
      } else {
        const thumb = await nImg.createThumbnailFromPath(absolutePath, { width: 300, height: 300 });
        if (!thumb.isEmpty()) {
          return thumb.toJPEG(80);
        }
      }
    } catch (e) {
      console.error('[DownloadManager] Thumbnail buffer error for:', absolutePath, e.message);
    }
    return null;
  }

  sanitizeFileName(name) {
    if (!name) return 'Document_' + Date.now();
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    // Remove characters illegal in Windows NTFS: \ / : * ? " < > |
    let safeBase = base.replace(/[\\/:*?"<>|]/g, '_').trim();
    // Windows cannot have trailing dots or spaces
    safeBase = safeBase.replace(/[. ]+$/, '');
    if (!safeBase) safeBase = 'Document_' + Date.now();
    return safeBase + ext;
  }

  async copyWithRetry(src, dest, retries = 3, delay = 100) {
    for (let i = 0; i < retries; i++) {
      try {
        fs.copyFileSync(src, dest);
        return true;
      } catch (err) {
        if (err.code === 'EBUSY' && i < retries - 1) {
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
  }

  async processDownloadedFile(tempPath, rawFileName, accountName) {
    try {
      if (!fs.existsSync(tempPath)) {
        return { success: false, reason: 'error', message: 'Temporary download file is missing.' };
      }
      const tempStat = fs.statSync(tempPath);
      if (tempStat.size === 0) {
        try { fs.unlinkSync(tempPath); } catch(e) {}
        return { success: false, reason: 'error', message: 'Downloaded file is empty (0 bytes).' };
      }

      let decodedName = rawFileName;
      try { decodedName = decodeURIComponent(rawFileName); } catch(e) {}
      const fileName = this.sanitizeFileName(decodedName);
      const settings = this.orchestrator.settingsManager.getSettingsSync();
      const baseDir = this.orchestrator.settingsManager.getMediaFolder();

      const sanitizeAccount = name => name.replace(/[\\/:*?"<>|]/g, '').trim() || 'Account';
      const safeAccName = sanitizeAccount(accountName || 'WhatsApp');

      const ext = path.extname(fileName).toLowerCase();
      let subFolder = 'Documents';
      let fileType = 'document';

      const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const vidExts = ['.mp4', '.avi', '.mkv', '.mov', '.webm'];
      const audExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.opus'];

      if (imgExts.includes(ext)) {
        subFolder = 'Images';
        fileType = 'image';
      } else if (vidExts.includes(ext)) {
        subFolder = 'Videos';
        fileType = 'video';
      } else if (audExts.includes(ext)) {
        subFolder = 'Audio';
        fileType = 'audio';
      }

      const targetDir = path.join(baseDir, safeAccName, subFolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const finalPath = path.join(targetDir, fileName);

      // Duplicate detection
      if (fs.existsSync(finalPath)) {
        const action = settings.duplicateAction || 'skip';
        if (action === 'skip') {
          try { fs.unlinkSync(tempPath); } catch(e) {}
          return {
            success: true, // Mark true so WhatsAppViewManager opens it immediately!
            alreadyExists: true,
            reason: 'duplicate',
            message: `File "${fileName}" already exists. Opened existing file.`,
            fileName,
            filePath: finalPath,
            fileType,
            size: fs.statSync(finalPath).size
          };
        } else if (action === 'overwrite') {
          await this.copyWithRetry(tempPath, finalPath);
        } else if (action === 'rename') {
          const nameWithoutExt = path.basename(fileName, ext);
          const timestamp = Date.now();
          const newFileName = `${nameWithoutExt}_${timestamp}${ext}`;
          const renamePath = path.join(targetDir, newFileName);
          await this.copyWithRetry(tempPath, renamePath);
          this.scheduleThumbnailGeneration(renamePath, fileType);
          try { fs.unlinkSync(tempPath); } catch(e) {}
          return {
            success: true,
            filePath: renamePath,
            fileName: newFileName,
            fileType,
            size: fs.statSync(renamePath).size
          };
        }
      } else {
        await this.copyWithRetry(tempPath, finalPath);
      }

      this.scheduleThumbnailGeneration(finalPath, fileType);
      try { fs.unlinkSync(tempPath); } catch(e) {}

      return {
        success: true,
        filePath: finalPath,
        fileName,
        fileType,
        size: fs.statSync(finalPath).size
      };
    } catch (e) {
      console.error('[DownloadManager] Error processing downloaded file:', e);
      try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch(err) {}
      return { success: false, reason: 'error', message: e.message };
    }
  }

  scheduleThumbnailGeneration(filePath, fileType) {
    if (fileType === 'image' || fileType === 'video') {
      setTimeout(async () => {
        try {
          const thumbPath = this.getThumbnailPath(filePath);
          if (!fs.existsSync(thumbPath)) {
            const buf = await this.generateThumbnailBuffer(filePath);
            if (buf) {
              fs.writeFile(thumbPath, buf, () => {});
            }
          }
        } catch (e) {
          console.error('[DownloadManager] Background thumbnail generation error:', e);
        }
      }, 50);
    }
  }

  listAllFiles() {
    const baseDir = this.orchestrator.settingsManager.getMediaFolder();
    let results = [];
    if (!fs.existsSync(baseDir)) return results;

    const readDirRec = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
          readDirRec(res);
        } else {
          results.push(entry.name);
        }
      }
    };

    try {
      readDirRec(baseDir);
    } catch (e) {}
    return results;
  }

  findFilePath(fileName) {
    const baseDir = this.orchestrator.settingsManager.getMediaFolder();
    if (!fs.existsSync(baseDir)) return null;

    let found = null;
    const readDirRec = (dir) => {
      if (found) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
          readDirRec(res);
        } else if (entry.name === fileName) {
          found = res;
          return;
        }
      }
    };

    try {
      readDirRec(baseDir);
    } catch (e) {}
    return found;
  }

  registerProtocols(protocol, nativeImage, net) {
    protocol.handle('nammil', async (request) => {
      if (request.url.startsWith('nammil://thumb/')) {
        const absolutePath = decodeURIComponent(request.url.replace('nammil://thumb/', ''));
        const thumbFilePath = this.getThumbnailPath(absolutePath);

        // 1. FAST PATH: Persistent disk cache hit (instant 0ms CPU resize)
        if (fs.existsSync(thumbFilePath)) {
          return net.fetch('file:///' + thumbFilePath.replace(/\\/g, '/'));
        }

        // 2. SLOW PATH: First view — generate 300px thumbnail and cache to disk
        try {
          const buf = await this.generateThumbnailBuffer(absolutePath, nativeImage);
          if (buf) {
            fs.writeFile(thumbFilePath, buf, (err) => {
              if (err) console.error('[DownloadManager] Failed to cache thumbnail:', err);
            });
            return new Response(buf, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000' } });
          }
        } catch (e) {
          console.error('Thumbnail generation failed for:', absolutePath, e.message);
        }
        return net.fetch('file:///' + absolutePath.replace(/\\/g, '/'));
      }
      
      if (request.url.startsWith('nammil://media/')) {
        const absolutePath = decodeURIComponent(request.url.replace('nammil://media/', ''));
        return net.fetch('file:///' + absolutePath.replace(/\\/g, '/'));
      }
      const url = request.url.replace('nammil://assets/', '');
      return net.fetch('file:///' + path.join(__dirname, '..', 'public', url).replace(/\\/g, '/'));
    });
  }

  registerIPC(ipcMain, shell) {
    ipcMain.handle('get-media', async (event, filter = 'All', accountName = 'All') => {
      const baseDir = this.orchestrator.settingsManager.getMediaFolder();
      let results = [];
      if (!fs.existsSync(baseDir)) return results;

      const filterAcc = (accountName || 'All').trim().toLowerCase();
      const isAllAccounts = filterAcc === 'all';

      const readDirRec = (dir, currentAccount) => {
        let entries = [];
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (e) {
          return;
        }

        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            let nextAccount = currentAccount;
            const isMediaCategory = ['images', 'videos', 'documents', 'audio', '.thumbnails'].includes(entry.name.toLowerCase());
            if (!nextAccount && !isMediaCategory) {
              nextAccount = entry.name;
            }
            readDirRec(res, nextAccount);
          } else {
            const accName = currentAccount || 'WhatsApp';
            if (!isAllAccounts && accName.toLowerCase() !== filterAcc) continue;

            const ext = path.extname(entry.name).toLowerCase();
            let stats;
            try {
              stats = fs.statSync(res);
            } catch (e) {
              continue;
            }

            let type = 'document';
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) type = 'image';
            else if (['.mp4', '.avi', '.mkv', '.mov', '.webm'].includes(ext)) type = 'video';
            else if (['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.opus'].includes(ext)) type = 'audio';

            if (filter !== 'All') {
              if (filter === 'Images' && type !== 'image') continue;
              if (filter === 'Videos' && type !== 'video') continue;
              if (filter === 'Audio' && type !== 'audio') continue;
              if (filter === 'Documents' && type !== 'document') continue;
            }

            results.push({
              id: crypto.randomUUID(),
              fileName: entry.name,
              name: entry.name,
              filePath: res,
              path: res,
              mediaType: type,
              type,
              size: stats.size,
              fileSize: stats.size,
              date: stats.mtime,
              account: accName,
              accountName: accName
            });
          }
        }
      };

      try {
        readDirRec(baseDir, null);
      } catch (e) {
        console.error('Error scanning media folder:', e);
      }
      return results.sort((a, b) => b.date - a.date);
    });

    ipcMain.on('open-media', (event, filePath) => {
      shell.openPath(filePath);
    });

    ipcMain.on('show-in-folder', (event, filePath) => {
      shell.showItemInFolder(filePath);
    });

    ipcMain.handle('get-all-downloaded-filenames', () => {
      return this.listAllFiles();
    });

    ipcMain.on('open-file-by-name', (event, fileName) => {
      const filePath = this.findFilePath(fileName);
      if (filePath) shell.openPath(filePath);
    });

    ipcMain.on('show-in-folder-by-name', (event, fileName) => {
      const filePath = this.findFilePath(fileName);
      if (filePath) shell.showItemInFolder(filePath);
    });
  }
}

module.exports = DownloadManager;
