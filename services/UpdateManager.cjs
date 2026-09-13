const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { dialog } = require('electron');

class UpdateManager {
  constructor(app, orchestrator) {
    this.app = app;
    this.orchestrator = orchestrator;
    this.autoUpdater = null;
    this.downloadedInstallerPath = null;
    this._checkingApi = false;
    this._isDownloading = false;
    this._lastFocusCheck = 0;
    this._isPrompting = false;
    this._dismissedVersions = new Set();
    this.currentStatus = {
      status: 'idle', // 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
      version: this.app && typeof this.app.getVersion === 'function' ? this.app.getVersion() : '1.1.0',
      percent: 0,
      transferred: 0,
      total: 0,
      error: null,
      isDev: !this.app || !this.app.isPackaged
    };
  }

  _getAutoUpdater() {
    if (this.autoUpdater) return this.autoUpdater;
    try {
      const { autoUpdater } = require('electron-updater');
      this.autoUpdater = autoUpdater;
      return this.autoUpdater;
    } catch (e) {
      console.warn('[UpdateManager] Could not load electron-updater:', e.message);
      return null;
    }
  }

  init() {
    const updater = this._getAutoUpdater();
    if (updater) {
      updater.autoDownload = false;
      updater.autoInstallOnAppQuit = true;

      // Always ensure app-update.yml exists in userData so electron-updater never fails with ENOENT
      try {
        if (this.app && typeof this.app.getPath === 'function') {
          const userDataDir = this.app.getPath('userData');
          if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
          }
          const configPath = path.join(userDataDir, 'app-update.yml');
          fs.writeFileSync(
            configPath,
            'owner: ElvanParthasarathy\nrepo: Nammil\nprovider: github\nupdaterCacheDirName: nammil-updater\n',
            'utf8'
          );
          updater.updateConfigPath = configPath;
        }

        updater.setFeedURL({
          provider: 'github',
          owner: 'ElvanParthasarathy',
          repo: 'Nammil'
        });
      } catch (configErr) {
        console.warn('[UpdateManager] Could not setup update config path:', configErr.message);
      }

      updater.on('checking-for-update', () => {
        this._updateState({ status: 'checking', error: null });
      });

      updater.on('update-available', (info) => {
        this._updateState({
          status: 'available',
          newVersion: info.version,
          releaseDate: info.releaseDate,
          error: null
        });
        this._promptUpdateAvailable(info.version, null, 0);
      });

      updater.on('update-not-available', (info) => {
        this._updateState({
          status: 'not-available',
          newVersion: info.version,
          error: null
        });
      });

      updater.on('error', (err) => {
        console.warn('[UpdateManager] autoUpdater error (falling back to GitHub direct API):', err ? err.message : err);
        // If electron-updater throws (e.g. latest.yml missing on GitHub), seamlessly fall back to GitHub Releases API
        this._checkGitHubApi();
      });

      updater.on('download-progress', (progressObj) => {
        this._updateState({
          status: 'downloading',
          percent: Math.round(progressObj.percent || 0),
          transferred: progressObj.transferred || 0,
          total: progressObj.total || 0,
          bytesPerSecond: progressObj.bytesPerSecond || 0
        });
      });

      updater.on('update-downloaded', (info) => {
        this._updateState({
          status: 'downloaded',
          newVersion: info.version,
          percent: 100
        });
        this._promptUpdateDownloaded(info.version);
      });
    }

    // In production, trigger a silent background check 8 seconds after launch
    if (this.app && this.app.isPackaged) {
      setTimeout(() => {
        this.checkForUpdates().catch((err) => {
          console.log('[UpdateManager] Background check skipped:', err.message);
        });
      }, 8000);
    }

    return this;
  }

  _updateState(newState) {
    this.currentStatus = {
      ...this.currentStatus,
      ...newState,
      version: this.app && typeof this.app.getVersion === 'function' ? this.app.getVersion() : '1.1.0',
      isDev: !this.app || !this.app.isPackaged
    };
    this._broadcast();
  }

  _broadcast() {
    try {
      if (
        this.orchestrator &&
        this.orchestrator.windowManager &&
        this.orchestrator.windowManager.mainWindow &&
        !this.orchestrator.windowManager.mainWindow.isDestroyed()
      ) {
        this.orchestrator.windowManager.mainWindow.webContents.send(
          'update-status-changed',
          this.currentStatus
        );
      }
    } catch (e) {
      // Ignore broadcast errors during window close
    }
  }

  async checkForUpdates() {
    this._updateState({ status: 'checking', error: null, percent: 0 });

    const updater = this._getAutoUpdater();

    // If packaged, attempt electron-updater first
    if (this.app && this.app.isPackaged && updater) {
      try {
        await updater.checkForUpdates();
        return this.currentStatus;
      } catch (err) {
        console.warn('[UpdateManager] electron-updater checkForUpdates threw, falling back to GitHub API:', err.message);
        return await this._checkGitHubApi();
      }
    }

    // In dev mode (unpackaged) or fallback, query GitHub Releases API directly
    return await this._checkGitHubApi();
  }

  async _checkGitHubApi() {
    if (this._checkingApi) return this.currentStatus;
    this._checkingApi = true;
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/ElvanParthasarathy/Nammil/releases/latest',
        method: 'GET',
        headers: {
          'User-Agent': 'Nammil-App'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          this._checkingApi = false;
          try {
            if (res.statusCode === 200) {
              const release = JSON.parse(data);
              const latestTag = release.tag_name ? release.tag_name.replace(/^v/, '') : '';
              const currentVer = this.app && typeof this.app.getVersion === 'function' ? this.app.getVersion() : '1.1.0';

              if (latestTag && latestTag !== currentVer && this._isNewerVersion(latestTag, currentVer)) {
                // Find installer asset if available
                const exeAsset = Array.isArray(release.assets) 
                  ? release.assets.find(a => a.name && a.name.toLowerCase().endsWith('.exe')) 
                  : null;

                this._updateState({
                  status: 'available',
                  newVersion: latestTag,
                  releaseNotes: release.body,
                  downloadUrl: exeAsset ? exeAsset.browser_download_url : null
                });

                // Prompt user before downloading
                this._promptUpdateAvailable(
                  latestTag,
                  exeAsset ? exeAsset.browser_download_url : null,
                  exeAsset ? (exeAsset.size || 0) : 0
                );
              } else {
                this._updateState({
                  status: 'not-available',
                  newVersion: currentVer
                });
              }
            } else {
              this._updateState({
                status: 'not-available',
                newVersion: this.app && typeof this.app.getVersion === 'function' ? this.app.getVersion() : '1.1.0'
              });
            }
          } catch (e) {
            this._updateState({
              status: 'error',
              error: e.message
            });
          }
          resolve(this.currentStatus);
        });
      });

      req.on('error', (err) => {
        this._checkingApi = false;
        this._updateState({
          status: 'error',
          error: err.message
        });
        resolve(this.currentStatus);
      });

      req.end();
    });
  }

  _downloadAsset(downloadUrl, totalSize) {
    if (this._isDownloading) return;
    this._isDownloading = true;
    this._updateState({ status: 'downloading', percent: 0 });

    const tempDir = this.app && typeof this.app.getPath === 'function' ? this.app.getPath('temp') : os.tmpdir();
    const targetFile = path.join(tempDir, 'Nammil-Update-Setup.exe');
    this.downloadedInstallerPath = targetFile;

    const followRedirectAndDownload = (url) => {
      const isHttps = url.startsWith('https:');
      const client = isHttps ? https : http;

      client.get(url, { headers: { 'User-Agent': 'Nammil-App' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return followRedirectAndDownload(res.headers.location);
        }

        if (res.statusCode !== 200) {
          this._updateState({ status: 'error', error: `Download failed with HTTP ${res.statusCode}` });
          return;
        }

        const size = totalSize || parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        const fileStream = fs.createWriteStream(targetFile);

        res.on('data', (chunk) => {
          downloaded += chunk.length;
          const percent = size > 0 ? Math.round((downloaded / size) * 100) : 50;
          this._updateState({
            status: 'downloading',
            percent,
            transferred: downloaded,
            total: size
          });
        });

        fileStream.on('finish', () => {
          fileStream.close();
          this._isDownloading = false;
          this._updateState({
            status: 'downloaded',
            percent: 100
          });
          this._promptUpdateDownloaded(this.currentStatus.newVersion);
        });

        fileStream.on('error', (err) => {
          this._isDownloading = false;
          this._updateState({ status: 'error', error: err.message });
        });

        res.pipe(fileStream);
      }).on('error', (err) => {
        this._isDownloading = false;
        this._updateState({ status: 'error', error: err.message });
      });
    };

    followRedirectAndDownload(downloadUrl);
  }

  _isNewerVersion(remote, current) {
    const rParts = remote.split('.').map(Number);
    const cParts = current.split('.').map(Number);
    for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
      const r = rParts[i] || 0;
      const c = cParts[i] || 0;
      if (r > c) return true;
      if (r < c) return false;
    }
    return false;
  }

  restartAndInstall() {
    const updater = this._getAutoUpdater();
    // If downloaded via direct fallback
    if (this.downloadedInstallerPath && fs.existsSync(this.downloadedInstallerPath)) {
      try {
        spawn(this.downloadedInstallerPath, ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART', '/SP-'], { detached: true, stdio: 'ignore' }).unref();
        if (this.app && typeof this.app.quit === 'function') {
          this.app.isQuitting = true;
          this.app.quit();
        }
        return;
      } catch (e) {
        console.warn('[UpdateManager] Could not spawn installer directly:', e.message);
      }
    }

    if (this.app && this.app.isPackaged && updater) {
      try {
        updater.quitAndInstall(true, true);
        return;
      } catch (e) {
        console.warn('[UpdateManager] quitAndInstall failed:', e.message);
      }
    }

    // Default relaunch
    if (this.app && typeof this.app.relaunch === 'function') {
      this.app.isQuitting = true;
      this.app.relaunch();
      this.app.exit(0);
    }
  }

  _setupWindowFocusListener() {
    try {
      const getWin = () => this.orchestrator && this.orchestrator.windowManager && this.orchestrator.windowManager.mainWindow;
      const win = getWin();
      if (win && !win.isDestroyed()) {
        win.on('focus', () => {
          this._onWindowFocus();
        });
      }
    } catch (e) {
      console.warn('[UpdateManager] Could not attach focus listener:', e.message);
    }
  }

  _onWindowFocus() {
    if (!this.app || !this.app.isPackaged) return;
    const now = Date.now();
    // Throttle focus checks: at most once every 15 minutes
    if (now - this._lastFocusCheck > 15 * 60 * 1000) {
      this._lastFocusCheck = now;
      this.checkForUpdates().catch((err) => {
        console.log('[UpdateManager] Focus check skipped:', err.message);
      });
    }
  }

  async _promptUpdateAvailable(newVersion, downloadUrl, size) {
    if (this._isPrompting || this._dismissedVersions.has(newVersion)) return;
    const win = this.orchestrator && this.orchestrator.windowManager && this.orchestrator.windowManager.mainWindow;
    if (!win || win.isDestroyed()) return;

    this._isPrompting = true;
    try {
      const { response } = await dialog.showMessageBox(win, {
        type: 'info',
        title: 'Update Available',
        message: `A new version of Nammil (v${newVersion}) is available!`,
        detail: 'Would you like to download and install this update now?',
        buttons: ['Update Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      });

      if (response === 0) {
        // User clicked "Update Now"
        if (downloadUrl) {
          this._downloadAsset(downloadUrl, size);
        } else {
          const updater = this._getAutoUpdater();
          if (updater && typeof updater.downloadUpdate === 'function') {
            updater.downloadUpdate();
          }
        }
      } else {
        // User clicked "Later"
        this._dismissedVersions.add(newVersion);
      }
    } catch (e) {
      console.warn('[UpdateManager] Error showing update available dialog:', e.message);
    } finally {
      this._isPrompting = false;
    }
  }

  async _promptUpdateDownloaded(newVersion) {
    if (this._isPrompting) return;
    const win = this.orchestrator && this.orchestrator.windowManager && this.orchestrator.windowManager.mainWindow;
    if (!win || win.isDestroyed()) return;

    this._isPrompting = true;
    try {
      const verText = newVersion ? ` (v${newVersion})` : '';
      const { response } = await dialog.showMessageBox(win, {
        type: 'info',
        title: 'Update Ready to Install',
        message: `Nammil${verText} has been downloaded.`,
        detail: 'Restart the app now to apply the update?',
        buttons: ['Restart & Install', 'Later'],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      });

      if (response === 0) {
        this.restartAndInstall();
      }
    } catch (e) {
      console.warn('[UpdateManager] Error showing update downloaded dialog:', e.message);
    } finally {
      this._isPrompting = false;
    }
  }

  registerIPC(ipcMain) {
    this._setupWindowFocusListener();

    ipcMain.handle('check-for-updates', async () => {
      return await this.checkForUpdates();
    });

    ipcMain.handle('get-update-status', () => {
      return this.currentStatus;
    });

    ipcMain.handle('start-download', () => {
      if (this.currentStatus.downloadUrl) {
        this._downloadAsset(this.currentStatus.downloadUrl, 0);
      } else {
        const updater = this._getAutoUpdater();
        if (updater && typeof updater.downloadUpdate === 'function') {
          updater.downloadUpdate();
        }
      }
    });

    ipcMain.on('restart-and-install', () => {
      this.restartAndInstall();
    });
  }
}

module.exports = UpdateManager;
