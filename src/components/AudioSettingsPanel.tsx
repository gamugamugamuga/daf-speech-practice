import { RefreshCw } from 'lucide-react';
import { copy } from '../i18n';
import { useAudioDevices } from '../hooks/useAudioDevices';
import type { Language } from '../types';
import { Button } from './Button';
import { Panel } from './Panel';
import { SelectField } from './SelectField';

type AudioSettingsPanelProps = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
  onInputDeviceChange: (deviceId: string) => void;
  onOutputDeviceChange: (deviceId: string) => void;
};

const deviceLabel = (device: MediaDeviceInfo, fallback: string, index: number) =>
  device.label || `${fallback} ${index + 1}`;

export function AudioSettingsPanel({
  language,
  inputDeviceId,
  outputDeviceId,
  onInputDeviceChange,
  onOutputDeviceChange,
}: AudioSettingsPanelProps) {
  const t = copy[language];
  const devices = useAudioDevices();

  return (
    <Panel
      title={t.audioSettings}
      description={t.audioSettingsDesc}
      action={
        <Button variant="ghost" icon={<RefreshCw size={16} aria-hidden />} onClick={() => void devices.refresh()}>
          {t.refreshDevices}
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-5">
        <SelectField
          label={t.inputDevice}
          value={inputDeviceId}
          onChange={(event) => onInputDeviceChange(event.target.value)}
        >
          <option value="default">{t.defaultDevice}</option>
          {devices.inputs.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {deviceLabel(device, t.inputDevice, index)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t.outputDevice}
          value={outputDeviceId}
          onChange={(event) => onOutputDeviceChange(event.target.value)}
        >
          <option value="default">{t.defaultDevice}</option>
          {devices.outputs.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {deviceLabel(device, t.outputDevice, index)}
            </option>
          ))}
        </SelectField>
      </div>

      {devices.error ? (
        <p className="mt-4 rounded-md bg-coral/15 px-3 py-2 text-sm font-semibold text-[#ffb7a5]">{devices.error}</p>
      ) : null}
    </Panel>
  );
}
