const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  printNota: (options) => ipcRenderer.invoke('app:print', options),
  savePDF: (options) => ipcRenderer.invoke('app:save-pdf', options)
});
