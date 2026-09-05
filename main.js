const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Database path configuration
function getDatabaseFilePath() {
  const userDataDir = app.getPath('userData');
  const dataDir = path.join(userDataDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'rcg_salt_v8.sqlite');
}

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
    let htmlContent = options.htmlContent || '';

    // Convert local logo paths to embedded base64 data URLs for 100% reliable rendering
    const logoFile = path.join(__dirname, 'assets/images/RCG.webp');
    if (fs.existsSync(logoFile)) {
      const logoBase64 = `data:image/webp;base64,${fs.readFileSync(logoFile).toString('base64')}`;
      htmlContent = htmlContent.replace(/src=["'](?:(?:\.\/)?assets\/images\/RCG\.webp|assets\/images\/RCG\.webp)["']/g, `src="${logoBase64}"`);
    }

    const baseHref = `file:///${path.join(__dirname, '/').replace(/\\/g, '/')}`;

    // Create an isolated offscreen BrowserWindow for pristine, zero-border PDF export
    const printWin = new BrowserWindow({
      show: false,
      width: 1024,
      height: 768,
      backgroundColor: '#FFFFFF',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const fullDoc = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <base href="${baseHref}">
  <title>${defaultFilename}</title>
  <link rel="stylesheet" href="assets/css/fonts.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #FFFFFF !important;
      background-color: #FFFFFF !important;
      color: #0F172A !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    @page {
      margin: 0 !important;
      size: ${pageSize} portrait;
    }
    .nota-container, .nota-sheet {
      margin: 0 auto !important;
      padding: 16px 20px !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      background: #FFFFFF !important;
    }
  </style>
</head>
<body style="background: #FFFFFF !important; margin: 0 !important; padding: 0 !important; border: none !important; outline: none !important;">
  ${htmlContent}
</body>
</html>`;

    await printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullDoc));

    const pdfBuffer = await printWin.webContents.printToPDF({
      printBackground: true,
      pageSize: pageSize,
      landscape: options.landscape || false,
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });

    printWin.destroy();

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

// =========================================================================
// SQLite Database Engine IPC Handlers (v8.0)
// =========================================================================

ipcMain.handle('db:load-file', async () => {
  try {
    const dbPath = getDatabaseFilePath();
    if (fs.existsSync(dbPath)) {
      const buffer = await fs.promises.readFile(dbPath);
      return { exists: true, data: buffer, path: dbPath };
    }
    return { exists: false, path: dbPath };
  } catch (err) {
    console.error('Error loading SQLite file:', err);
    return { exists: false, error: err.message };
  }
});

ipcMain.handle('db:save-file', async (event, binaryArray) => {
  try {
    const dbPath = getDatabaseFilePath();
    const buffer = Buffer.from(binaryArray);
    await fs.promises.writeFile(dbPath, buffer);

    // Also maintain a duplicate backup in local project directory /data/
    try {
      const localDataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(localDataDir)) {
        fs.mkdirSync(localDataDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(localDataDir, 'rcg_database.sqlite'), buffer);
    } catch (e) {}

    return { success: true, path: dbPath };
  } catch (err) {
    console.error('Error saving SQLite file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:export-file', async (event, binaryArray, defaultName) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Unduh Database SQLite PT. RCG',
      defaultPath: defaultName || `RCG_Database_${new Date().toISOString().slice(0, 10)}.sqlite`,
      filters: [
        { name: 'SQLite Database (*.sqlite; *.db)', extensions: ['sqlite', 'db'] },
        { name: 'Semua File (*.*)', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const buffer = Buffer.from(binaryArray);
    await fs.promises.writeFile(result.filePath, buffer);
    return { success: true, filePath: result.filePath };
  } catch (err) {
    console.error('Error exporting SQLite file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:import-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Buka File Database SQLite',
      properties: ['openFile'],
      filters: [
        { name: 'SQLite Database (*.sqlite; *.db)', extensions: ['sqlite', 'db'] },
        { name: 'Semua File (*.*)', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const buffer = await fs.promises.readFile(filePath);
    return { success: true, data: buffer, filePath: filePath };
  } catch (err) {
    console.error('Error importing SQLite file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:get-path', () => {
  return getDatabaseFilePath();
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
