import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appInfo', {
  platform: process.platform,
});

contextBridge.exposeInMainWorld('globalInput', {
  configureHold: (config: { enabled: boolean; holdKeyCode: string }) =>
    ipcRenderer.invoke('global-input:configure-hold', config),
  recordNextKey: () => ipcRenderer.invoke('global-input:record-next-key'),
  cancelKeyRecord: () => ipcRenderer.send('global-input:cancel-record-key'),
  onHoldState: (callback: (state: { pressed: boolean; code: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: { pressed: boolean; code: string }) => callback(state);
    ipcRenderer.on('global-input:hold-state', listener);
    return () => ipcRenderer.removeListener('global-input:hold-state', listener);
  },
});
