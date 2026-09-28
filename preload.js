const { contextBridge, ipcRenderer, webFrame } = require('electron');

// Lock zoom factor in preload frame immediately
try {
  webFrame.setZoomFactor(1.0);
  webFrame.setVisualZoomLevelLimits(1, 1);
} catch (e) {}

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getSystemPrinters: () => ipcRenderer.invoke('app:get-printers'),
  generatePdfPreview: (options) => ipcRenderer.invoke('app:generate-pdf-preview', options),
  printNota: (options) => ipcRenderer.invoke('app:print', options),
  savePDF: (options) => ipcRenderer.invoke('app:save-pdf', options),
  dbLoadFile: () => ipcRenderer.invoke('db:load-file'),
  dbSaveFile: (binaryBuffer) => ipcRenderer.invoke('db:save-file', binaryBuffer),
  dbExportFile: (binaryBuffer, defaultName) => ipcRenderer.invoke('db:export-file', binaryBuffer, defaultName),
  dbImportFile: () => ipcRenderer.invoke('db:import-file'),
  dbGetPath: () => ipcRenderer.invoke('db:get-path'),
  getSystemSerialPorts: () => ipcRenderer.invoke('serial:get-ports'),
  setTargetSerialPort: (portName) => ipcRenderer.invoke('serial:set-target-port', portName),
  onSerialPortAdded: (callback) => ipcRenderer.on('serial:port-added', (e, port) => callback(port)),
  onSerialPortRemoved: (callback) => ipcRenderer.on('serial:port-removed', (e, port) => callback(port)),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url)
});

