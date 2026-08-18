const { app, BrowserWindow, session, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.cjs"),
    }
  });

  win.loadURL("http://localhost:5173");
  win.webContents.openDevTools();
}

// Handle Native Print Dialog via IPC
ipcMain.handle("print-image", async (event, base64Data) => {
  return new Promise((resolve, reject) => {
    let workerWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        webSecurity: false
      }
    });

    workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <head>
          <style>
            @page { margin: 0; size: auto; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: white; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${base64Data}" />
        </body>
      </html>
    `)}`);

    workerWindow.webContents.once('did-finish-load', () => {
      // silent: false opens the native system print dialog instead of Chrome preview
      workerWindow.webContents.print({
        silent: false,
        printBackground: true,
        margins: { marginType: 'none' }
      }, (success, errorType) => {
        workerWindow.close();
        if (success) {
          resolve({ success: true });
        } else {
          // Note: Cancelling print also calls this callback with success = false
          reject(new Error(errorType || 'Printing cancelled or failed'));
        }
      });
    });
  });
});

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