const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const isDev = !app.isPackaged;

  // In production, Vite copies public files to dist/
  const iconPath = isDev 
    ? path.join(__dirname, 'public/favicon.ico') 
    : path.join(__dirname, 'dist/favicon.ico');

  const win = new BrowserWindow({
    width: 680, // Default comfortable width
    height: 500, // Default comfortable height
    minWidth: 400,
    minHeight: 300,
    transparent: true, // Make background transparent
    frame: false, // Remove Windows default title bar
    hasShadow: true, // Add nice shadow
    alwaysOnTop: false, // Default to false, controlled by React state
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
    title: "kmk's LexRead",
    icon: iconPath
  });

  if (isDev) {
    // In development, load from the Vite dev server
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    // In production, load the built html file
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // Listen for pin status changes from the renderer
  ipcMain.on('update-pin-state', (event, isPinned) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setAlwaysOnTop(isPinned);
    }
  });

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