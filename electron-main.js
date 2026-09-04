const { app, BrowserWindow, session, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

const DEFAULT_START_URL = 'https://www.instagram.com/direct/inbox/';
const STORIES_URL = 'https://www.instagram.com/';
const CSS_PATH = path.join(__dirname, 'electron', 'focus-styles.css');
const PRELOAD_PATH = path.join(__dirname, 'electron', 'focus-shield.js');
const ICON_PATH = path.join(__dirname, 'electron', 'icon.png');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function isDistractionUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('/reels/') ||
    lower.endsWith('/reels') ||
    lower.includes('/reels?') ||
    lower.includes('/explore/') ||
    lower.endsWith('/explore') ||
    lower.includes('/explore?')
  );
}

function setupNetworkFilters(ses) {
  // Intercept and redirect any network requests targeting reels or explore
  const filter = {
    urls: ['*://*.instagram.com/*'],
  };

  ses.webRequest.onBeforeRequest(filter, (details, callback) => {
    if (isDistractionUrl(details.url)) {
      if (details.resourceType === 'main_frame') {
        // Redirect browser to direct inbox
        callback({ redirectURL: DEFAULT_START_URL });
        return;
      }
      // Cancel background fetch/xhr for reels or explore feeds
      callback({ cancel: true });
      return;
    }
    callback({ cancel: false });
  });
}

function injectFocusStyles(webContents) {
  try {
    if (fs.existsSync(CSS_PATH)) {
      const css = fs.readFileSync(CSS_PATH, 'utf8');
      webContents.insertCSS(css).catch((err) => {
        console.error('Failed to inject focus CSS:', err);
      });
    }
  } catch (err) {
    console.error('Error reading focus CSS file:', err);
  }
}

function createFocusMenu() {
  const template = [
    {
      label: 'Focus Navigation',
      submenu: [
        {
          label: '💬 Direct Messages',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) mainWindow.loadURL(DEFAULT_START_URL);
          },
        },
        {
          label: '📸 Stories (Home Tray)',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) mainWindow.loadURL(STORIES_URL);
          },
        },
        {
          label: '✕ Exit Story',
          accelerator: 'Escape',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                if (window.focusShield && typeof window.focusShield.exitStory === 'function') {
                  window.focusShield.exitStory();
                } else if (window.location.pathname.startsWith('/stories')) {
                  window.location.href = 'https://www.instagram.com/direct/inbox/';
                }
              `).catch(() => {});
            }
          },
        },
        { type: 'separator' },
        {
          label: '🔄 Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        {
          label: '⬅️ Back',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          },
        },
        {
          label: '➡️ Forward',
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Exit Focus App',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: 'Shield Info',
      submenu: [
        {
          label: '🛡️ Reels: Blocked',
          enabled: false,
        },
        {
          label: '🛡️ Explore: Blocked',
          enabled: false,
        },
        {
          label: '🛡️ Infinite Feed: Blocked',
          enabled: false,
        },
        {
          label: '✓ Allowed: Stories & Messages Only',
          enabled: false,
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createDesktopWindow() {
  const customSession = session.fromPartition('persist:instagram_focus_session');
  customSession.setUserAgent(USER_AGENT);
  setupNetworkFilters(customSession);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    title: 'Instagram Focus • Stories & Messages Only',
    icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      session: customSession,
      preload: PRELOAD_PATH,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: true,
    },
  });

  createFocusMenu();

  // Load start page (Direct Messages)
  mainWindow.loadURL(DEFAULT_START_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Inject focus styles whenever page finishes loading or navigation occurs
  mainWindow.webContents.on('did-finish-load', () => {
    injectFocusStyles(mainWindow.webContents);
  });

  mainWindow.webContents.on('did-navigate', (event, url) => {
    injectFocusStyles(mainWindow.webContents);
  });

  mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
    if (isDistractionUrl(url)) {
      mainWindow.loadURL(DEFAULT_START_URL);
    }
  });

  // Intercept any navigation event targeting reels or explore
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isDistractionUrl(url)) {
      event.preventDefault();
      mainWindow.loadURL(DEFAULT_START_URL);
    }
  });

  // Handle new window / link clicks
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isDistractionUrl(url)) {
      return { action: 'deny' };
    }
    // Allow internal Instagram links in the same window
    if (url.includes('instagram.com')) {
      mainWindow.loadURL(url);
      return { action: 'deny' };
    }
    // External links open in user's default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers from renderer
ipcMain.on('focus-navigate', (event, target) => {
  if (!mainWindow) return;
  if (target === 'direct' || target === 'exit-story') {
    mainWindow.loadURL(DEFAULT_START_URL);
  } else if (target === 'stories') {
    mainWindow.loadURL(STORIES_URL);
  }
});

app.on('ready', () => {
  createDesktopWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createDesktopWindow();
  }
});
