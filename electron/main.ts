import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import type { UiohookKeyboardEvent } from 'uiohook-napi';

type UiohookModule = typeof import('uiohook-napi');
type HoldConfig = {
  enabled: boolean;
  holdKeyCode: string;
};

let uiohookModule: UiohookModule | null = null;
let isGlobalHookStarted = false;
let holdConfig: HoldConfig = { enabled: false, holdKeyCode: 'F13' };
let holdKeycode: number | null = null;
let isGlobalHoldPressed = false;
let pendingKeyRecord: ((code: string | null) => void) | null = null;

try {
  uiohookModule = require('uiohook-napi') as UiohookModule;
} catch (error) {
  console.warn('Global input hook is unavailable:', error);
}

const resolveIndexHtml = () => path.join(app.getAppPath(), 'dist', 'index.html');

const keyMap = () => (uiohookModule?.UiohookKey ?? {}) as Record<string, number>;

const codeToUiohookKeycode = (code: string) => {
  const keys = keyMap();
  const normalizedCode = code.replace(/^Key([A-Z])$/, '$1').replace(/^Digit([0-9])$/, '$1');
  return keys[normalizedCode] ?? null;
};

const uiohookKeycodeToCode = (keycode: number) => {
  const entry = Object.entries(keyMap()).find(([, value]) => value === keycode);
  const code = entry?.[0];

  if (!code) {
    return null;
  }

  if (/^[A-Z]$/.test(code)) {
    return `Key${code}`;
  }

  if (/^[0-9]$/.test(code)) {
    return `Digit${code}`;
  }

  return code;
};

const sendGlobalHoldState = (pressed: boolean) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('global-input:hold-state', {
      pressed,
      code: holdConfig.holdKeyCode,
    });
  });
};

const setGlobalHoldPressed = (pressed: boolean) => {
  if (isGlobalHoldPressed === pressed) {
    return;
  }

  isGlobalHoldPressed = pressed;
  sendGlobalHoldState(pressed);
};

const configureGlobalHold = (config: HoldConfig) => {
  holdConfig = config;
  holdKeycode = codeToUiohookKeycode(config.holdKeyCode);
  setGlobalHoldPressed(false);
};

const resolvePendingKeyRecord = (code: string | null) => {
  pendingKeyRecord?.(code);
  pendingKeyRecord = null;
};

const handleGlobalKeyDown = (event: UiohookKeyboardEvent) => {
  if (pendingKeyRecord) {
    const code = uiohookKeycodeToCode(event.keycode);
    resolvePendingKeyRecord(code === 'Escape' ? null : code);
    return;
  }

  if (!holdConfig.enabled || holdKeycode === null || event.keycode !== holdKeycode) {
    return;
  }

  setGlobalHoldPressed(true);
};

const handleGlobalKeyUp = (event: UiohookKeyboardEvent) => {
  if (!holdConfig.enabled || holdKeycode === null || event.keycode !== holdKeycode) {
    return;
  }

  setGlobalHoldPressed(false);
};

const startGlobalInputHook = () => {
  if (!uiohookModule || isGlobalHookStarted) {
    return;
  }

  uiohookModule.uIOhook.on('keydown', handleGlobalKeyDown);
  uiohookModule.uIOhook.on('keyup', handleGlobalKeyUp);
  uiohookModule.uIOhook.start();
  isGlobalHookStarted = true;
};

const stopGlobalInputHook = () => {
  if (!uiohookModule || !isGlobalHookStarted) {
    return;
  }

  resolvePendingKeyRecord(null);
  uiohookModule.uIOhook.off('keydown', handleGlobalKeyDown);
  uiohookModule.uIOhook.off('keyup', handleGlobalKeyUp);
  uiohookModule.uIOhook.stop();
  isGlobalHookStarted = false;
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1220,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#f7f5ef',
    title: 'DAF Speech Practice',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  mainWindow.loadFile(resolveIndexHtml());
};

app.whenReady().then(() => {
  startGlobalInputHook();

  ipcMain.handle('global-input:configure-hold', (_event, config: HoldConfig) => {
    configureGlobalHold(config);
    return {
      available: Boolean(uiohookModule),
      mapped: holdKeycode !== null,
    };
  });

  ipcMain.handle('global-input:record-next-key', () => {
    if (!uiohookModule) {
      return null;
    }

    return new Promise<string | null>((resolve) => {
      resolvePendingKeyRecord(null);
      pendingKeyRecord = resolve;
    });
  });

  ipcMain.on('global-input:cancel-record-key', () => {
    resolvePendingKeyRecord(null);
  });

  createWindow();

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

app.on('before-quit', () => {
  stopGlobalInputHook();
});
