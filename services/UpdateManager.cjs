const https = require('https');

class UpdateManager {
  constructor(app, orchestrator) {
    this.app = app;
    this.orchestrator = orchestrator;
    this.autoUpdater = null;
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
      updater.autoDownload = true;
      updater.autoInstallOnAppQuit = true;

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
      });

      updater.on('update-not-available', (info) => {
        this._updateState({
          status: 'not-available',
          newVersion: info.version,
          error: null
        });
      });

      updater.on('error', (err) => {
        console.error('[UpdateManager] Error:', err);
        this._updateState({
          status: 'error',
          error: err ? (err.message || String(err)) : 'Unknown update error'
        });
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
      });
    }

    // In production, trigger a silent background check 8 seconds after launch
    if (this.app && this.app.isPackaged && updater) {
      setTimeout(() => {
        try {
          updater.checkForUpdates().catch((err) => {
            console.log('[UpdateManager] Background check skipped or failed:', err.message);
          });
        } catch (e) {
          console.log('[UpdateManager] Early background check error:', e.message);
        }
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

    // If packaged, use electron-updater
    if (this.app && this.app.isPackaged && updater) {
      try {
        await updater.checkForUpdates();
        return this.currentStatus;
      } catch (err) {
        console.error('[UpdateManager] Manual check error:', err);
        this._updateState({
          status: 'error',
          error: err ? (err.message || 'Check failed') : 'Check failed'
        });
        return this.currentStatus;
      }
    }

    // In dev mode (unpackaged), query GitHub API directly to test checks without failing
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
          try {
            if (res.statusCode === 200) {
              const release = JSON.parse(data);
              const latestTag = release.tag_name ? release.tag_name.replace(/^v/, '') : '';
              const currentVer = this.app && typeof this.app.getVersion === 'function' ? this.app.getVersion() : '1.1.0';

              if (latestTag && latestTag !== currentVer && this._isNewerVersion(latestTag, currentVer)) {
                this._updateState({
                  status: 'available',
                  newVersion: latestTag,
                  releaseNotes: release.body,
                  isDev: true
                });
              } else {
                this._updateState({
                  status: 'not-available',
                  newVersion: currentVer,
                  isDev: true
                });
              }
            } else {
              this._updateState({
                status: 'not-available',
                newVersion: this.app && typeof this.app.getVersion === 'function' ? this.app.getVersion() : '1.1.0',
                isDev: true
              });
            }
          } catch (e) {
            this._updateState({
              status: 'error',
              error: e.message,
              isDev: true
            });
          }
          resolve(this.currentStatus);
        });
      });

      req.on('error', (err) => {
        this._updateState({
          status: 'error',
          error: err.message,
          isDev: true
        });
        resolve(this.currentStatus);
      });

      req.end();
    });
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
    if (this.app && this.app.isPackaged && updater) {
      updater.quitAndInstall();
    } else {
      // In dev mode, relaunch
      if (this.app && typeof this.app.relaunch === 'function') {
        this.app.isQuitting = true;
        this.app.relaunch();
        this.app.exit(0);
      }
    }
  }

  registerIPC(ipcMain) {
    ipcMain.handle('check-for-updates', async () => {
      return await this.checkForUpdates();
    });

    ipcMain.handle('get-update-status', () => {
      return this.currentStatus;
    });

    ipcMain.on('restart-and-install', () => {
      this.restartAndInstall();
    });
  }
}

module.exports = UpdateManager;
