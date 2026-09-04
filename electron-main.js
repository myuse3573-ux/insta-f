const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let mainWindow = null;
let nextServerProcess = null;

const PORT = 3000;
const APP_URL = `http://localhost:${PORT}`;

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(APP_URL, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

async function waitForServer(timeoutMs = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const running = await isServerRunning();
    if (running) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function startNextServer() {
  console.log('Starting Next.js background server...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  nextServerProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: __dirname,
    shell: true,
    stdio: 'ignore',
  });

  nextServerProcess.on('error', (err) => {
    console.error('Failed to start Next.js dev server:', err);
  });
}

function createDesktopWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'Instagram Messaging Dashboard',
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  const alreadyRunning = await isServerRunning();
  if (!alreadyRunning) {
    startNextServer();
  }

  const serverReady = await waitForServer();
  if (serverReady) {
    createDesktopWindow();
  } else {
    console.error('Next.js server failed to respond in time.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (nextServerProcess) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', nextServerProcess.pid, '/f', '/t']);
      } else {
        nextServerProcess.kill();
      }
    } catch (e) {
      // Ignore cleanup error
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
