/// <reference types="vite/client" />

interface Window {
  appInfo?: {
    platform: string;
  };
  globalInput?: {
    configureHold: (config: { enabled: boolean; holdKeyCode: string }) => Promise<{ available: boolean; mapped: boolean }>;
    recordNextKey: () => Promise<string | null>;
    cancelKeyRecord: () => void;
    onHoldState: (callback: (state: { pressed: boolean; code: string }) => void) => () => void;
  };
}
