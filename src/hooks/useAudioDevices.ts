import { useCallback, useEffect, useState } from 'react';

export type AudioDeviceLists = {
  inputs: MediaDeviceInfo[];
  outputs: MediaDeviceInfo[];
  error: string | null;
  refresh: () => Promise<void>;
};

export function useAudioDevices(): AudioDeviceLists {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setInputs(devices.filter((device) => device.kind === 'audioinput'));
      setOutputs(devices.filter((device) => device.kind === 'audiooutput'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'device_error');
    }
  }, []);

  useEffect(() => {
    void refresh();
    navigator.mediaDevices.addEventListener?.('devicechange', refresh);

    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', refresh);
    };
  }, [refresh]);

  return { inputs, outputs, error, refresh };
}
