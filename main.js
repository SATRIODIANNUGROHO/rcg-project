const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;
let splashWindow;

function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 540,
    height: 360,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    skipTaskbar: true,
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createWindow() {
  createSplashScreen();

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1100,
    minHeight: 700,
    title: 'PT. Reka Cipta Garam | Salt Weighing System',
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    backgroundColor: '#0B1120',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableBlinkFeatures: 'Serial'
    }
  });

  // Handle Serial Permissions in Electron
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (permission === 'serial') {
      return true;
    }
    return false;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'serial') {
      return true;
    }
    return false;
  });

  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    if (portList && portList.length > 0) {
      callback(portList[0].portId);
    } else {
      callback('');
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'login.html'));

  let hasTransitioned = false;
  const revealMainWindow = () => {
    if (hasTransitioned) return;
    hasTransitioned = true;

    if (splashWindow && !splashWindow.isDestroyed()) {
      try {
        splashWindow.setAlwaysOnTop(false);
        splashWindow.destroy();
      } catch (e) {
        // ignore
      }
      splashWindow = null;
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.maximize();
      mainWindow.focus();
    }
  };

  mainWindow.once('ready-to-show', () => {
    setTimeout(revealMainWindow, 1200);
  });

  // Safety fallback timeout to ensure window always appears without stalling
  setTimeout(revealMainWindow, 2400);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for desktop integration
ipcMain.handle('app:print', async (event, options) => {
  if (!mainWindow) return false;
  try {
    mainWindow.webContents.print({
      silent: false,
      printBackground: true,
      ...options
    });
    return true;
  } catch (error) {
    console.error('Print error:', error);
    return false;
  }
});

ipcMain.handle('app:save-pdf', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };
  try {
    const fs = require('fs');
    const defaultFilename = options.defaultFilename || 'Dokumen_RCG.pdf';

    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Unduh / Simpan Dokumen PDF',
      defaultPath: defaultFilename,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    let pageSize = 'A4';
    if (options.paperSize === 'A6') pageSize = 'A6';
    else if (options.paperSize === 'A5') pageSize = 'A5';
    else if (options.paperSize === 'Letter') pageSize = 'Letter';
    else if (options.paperSize === 'NCR_Wartel') pageSize = 'Letter';

    const pdfBuffer = await mainWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: pageSize,
      landscape: options.landscape || false,
      margins: {
        top: 0.2,
        bottom: 0.2,
        left: 0.2,
        right: 0.2
      }
    });

    await fs.promises.writeFile(filePath, pdfBuffer);
    return { success: true, filePath: filePath };
  } catch (err) {
    console.error('Failed to save PDF:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
