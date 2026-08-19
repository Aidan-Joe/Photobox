const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: () => true,
  printImage: (base64Data) => ipcRenderer.invoke("print-image", base64Data),
});
