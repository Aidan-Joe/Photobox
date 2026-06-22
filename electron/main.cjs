const { app, BrowserWindow, session } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  // Automatically grant camera (media) permissions for photobox
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
    } else {
      callback(false);
    }
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, origin, details) => {
    if (permission === 'media') {
      return true;
    }
    return false;
  });

  createWindow();
});