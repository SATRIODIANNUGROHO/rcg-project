const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
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
  onSerialPortRemoved: (callback) => ipcRenderer.on('serial:port-removed', (e, port) => callback(port))
});

