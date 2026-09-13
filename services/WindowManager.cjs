const path = require('path');
const { BrowserWindow, nativeImage } = require('electron');

class WindowManager {
  constructor(app, nativeTheme, settingsManager) {
    this.app = app;
    this.nativeTheme = nativeTheme;
    this.settingsManager = settingsManager;
    this.mainWindow = null;
  }

  createWindow() {
    const isLight = this.nativeTheme.shouldUseDarkColors === false;
    const bg = isLight ? '#FAFAFA' : '#0A0A0A';
    const iconPath = path.join(__dirname, '..', 'src', 'assets', 'app_icon.ico');
    const settings = this.settingsManager ? this.settingsManager.getSettingsSync() : {};
    const isFirstBoot = settings.isFirstBoot === true;

    this.mainWindow = new BrowserWindow({
      width: isFirstBoot ? 980 : 1280,
      height: isFirstBoot ? 540 : 840,
      minWidth: isFirstBoot ? 980 : 940,
      minHeight: isFirstBoot ? 540 : 650,
      resizable: !isFirstBoot,
      maximizable: !isFirstBoot,
      show: false, // Hide until maximized
      center: true,
      backgroundColor: bg,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: 'rgba(0,0,0,0)',
        symbolColor: isLight ? '#111b21' : '#e9edef',
        height: 48
      },
      icon: nativeImage.createFromPath(iconPath),
      webPreferences: {
        preload: path.join(__dirname, '..', 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Show window safely with guaranteed fallback
    let hasShown = false;
    const showWindow = () => {
      if (hasShown) return;
      if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
      hasShown = true;

      if (process.argv.includes('--hidden') || process.argv.includes('--minimized')) {
        // Run silently in background / system tray on boot
        return;
      }

      if (!isFirstBoot) {
        this.mainWindow.maximize();
      }
      
      this.mainWindow.show();
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.setAlwaysOnTop(true);
      this.mainWindow.focus();
      
      setTimeout(() => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.setAlwaysOnTop(false);
        }
      }, 300);
    };

    this.mainWindow.once('ready-to-show', showWindow);

    // Safety fallback: if ready-to-show is delayed by asset loading, force show within 6s
    setTimeout(showWindow, 6000);

    // Load frontend
    if (process.env.VITE_DEV_SERVER_URL) {
      const devUrl = process.env.VITE_DEV_SERVER_URL;
      const loadDev = () => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
        this.mainWindow.loadURL(devUrl).catch(() => {});
      };
      loadDev();
      this.mainWindow.webContents.on('did-fail-load', (_event, errorCode) => {
        if (errorCode === -102 || errorCode === -105 || errorCode === -100) {
          setTimeout(loadDev, 1000);
        }
      });
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // Register DevTools shortcuts
    import('electron').then(({ globalShortcut }) => {
      const toggleDevTools = () => {
        if (this.mainWindow && this.mainWindow.isFocused()) {
          this.mainWindow.webContents.toggleDevTools();
        }
      };
      globalShortcut.register('CommandOrControl+Shift+I', toggleDevTools);
      globalShortcut.register('F12', toggleDevTools);
    });

    // Lock zoom to 100% — disable all zoom shortcuts
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      // Block Ctrl+Plus, Ctrl+Minus, Ctrl+=, Ctrl+0, Ctrl+Shift+Plus
      if (input.control && !input.alt) {
        if (input.key === '+' || input.key === '=' || input.key === '-' || input.key === '_') {
          event.preventDefault();
        }
        if (input.shift && (input.key === '+' || input.key === '=')) {
          event.preventDefault();
        }
      }
    });

    // Also block Ctrl+Scroll zoom and force zoom level to 0 (100%)
    this.mainWindow.webContents.setZoomFactor(1);
    this.mainWindow.webContents.setZoomLevel(0);
    this.mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
    this.mainWindow.webContents.on('zoom-changed', () => {
      this.mainWindow.webContents.setZoomLevel(0);
    });

    return this.mainWindow;
  }
}

module.exports = WindowManager;
