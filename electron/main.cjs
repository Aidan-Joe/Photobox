const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
  fullscreen: true,
});

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);