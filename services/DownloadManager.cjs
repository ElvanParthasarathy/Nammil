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

  async processDownloadedFile(tempPath, fileName, accountName) {
    try {
      const settings = this.orchestrator.settingsManager.getSettingsSync();
      const baseDir = this.orchestrator.settingsManager.getMediaFolder();

      const sanitize = name => name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'Account';
      const safeAccName = sanitize(accountName || 'WhatsApp');

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
          return {
            success: false,
            reason: 'duplicate',
            message: `File "${fileName}" already exists. Skipped download.`,
            fileName,
            filePath: finalPath
          };
        } else if (action === 'overwrite') {
          fs.copyFileSync(tempPath, finalPath);
        } else if (action === 'rename') {
          const nameWithoutExt = path.basename(fileName, ext);
          const timestamp = Date.now();
          const newFileName = `${nameWithoutExt}_${timestamp}${ext}`;
          const renamePath = path.join(targetDir, newFileName);
          fs.copyFileSync(tempPath, renamePath);
          this.scheduleThumbnailGeneration(renamePath, fileType);
          return {
            success: true,
            filePath: renamePath,
            fileName: newFileName,
            fileType,
            size: fs.statSync(renamePath).size
          };
        }
      } else {
        fs.copyFileSync(tempPath, finalPath);
      }

      this.scheduleThumbnailGeneration(finalPath, fileType);
      return {
        success: true,
        filePath: finalPath,
        fileName,
        fileType,
        size: fs.statSync(finalPath).size
      };
    } catch (e) {
      console.error('Error processing downloaded file:', e);
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

      const readDirRec = (dir, currentAccount) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            readDirRec(res, currentAccount || entry.name);
          } else {
            if (accountName !== 'All' && currentAccount !== accountName) continue;

            const ext = path.extname(entry.name).toLowerCase();
            const stats = fs.statSync(res);
            let type = 'document';
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) type = 'image';
            else if (['.mp4', '.avi', '.mkv', '.mov'].includes(ext)) type = 'video';
            else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) type = 'audio';

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
              account: currentAccount || 'WhatsApp',
              accountName: currentAccount || 'WhatsApp'
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
