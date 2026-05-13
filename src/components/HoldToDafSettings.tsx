import { Keyboard, X } from 'lucide-react';
import type { Language } from '../types';
import { copy } from '../i18n';
import { Button } from './Button';
import { SliderField } from './SliderField';
import { ToggleSwitch } from './ToggleSwitch';

type HoldToDafSettingsProps = {
  language: Language;
  enabled: boolean;
  holdKeyCode: string;
  formattedHoldKey: string;
  fadeMs: number;
  isRecordingKey: boolean;
  hasCompetingKeyWarning: boolean;
  isFootPedalFriendly: boolean;
  isGlobalInputAvailable: boolean;
  isGlobalInputMapped: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onFadeChange: (value: number) => void;
  onHoldKeyChange: (code: string) => void;
  onStartKeyRecording: () => void;
  onCancelKeyRecording: () => void;
};

export function HoldToDafSettings({
  language,
  enabled,
  holdKeyCode,
  formattedHoldKey,
  fadeMs,
  isRecordingKey,
  hasCompetingKeyWarning,
  isFootPedalFriendly,
  isGlobalInputAvailable,
  isGlobalInputMapped,
  onEnabledChange,
  onFadeChange,
  onHoldKeyChange,
  onStartKeyRecording,
  onCancelKeyRecording,
}: HoldToDafSettingsProps) {
  const t = copy[language];

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <ToggleSwitch checked={enabled} label={enabled ? t.holdMode : t.alwaysOnMode} onChange={onEnabledChange} />

      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div>
          <div className="text-sm font-semibold text-moss">{t.holdKey}</div>
          <div
            className={`mt-2 flex h-14 items-center justify-between rounded-lg border px-4 ${
              isRecordingKey ? 'border-mint bg-mint/12' : 'border-white/10 bg-[#0c1418]'
            }`}
          >
            <span className="font-mono text-2xl font-black text-ink">
              {isRecordingKey ? t.keyReady : formattedHoldKey}
            </span>
            <span className="text-xs font-bold text-moss">{holdKeyCode}</span>
          </div>
        </div>
        {isRecordingKey ? (
          <Button variant="secondary" icon={<X size={17} aria-hidden />} onClick={onCancelKeyRecording}>
            {t.cancel}
          </Button>
        ) : (
          <Button variant="primary" icon={<Keyboard size={17} aria-hidden />} onClick={onStartKeyRecording}>
            {t.changeKey}
          </Button>
        )}
      </div>

      {isRecordingKey ? <p className="text-sm font-semibold text-mint">{t.keyRecording}</p> : null}
      <p className="text-xs font-bold text-moss">{t.recommendedFootPedal}</p>
      <p className={`text-xs font-bold ${isGlobalInputAvailable && isGlobalInputMapped ? 'text-mint' : 'text-[#ffb7a5]'}`}>
        {isGlobalInputAvailable
          ? isGlobalInputMapped
            ? t.globalInputActive
            : t.globalInputUnmapped
          : t.globalInputUnavailable}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t.presetFootPedal, code: 'F13' },
          { label: t.presetPc, code: 'Space' },
          { label: t.presetOutside, code: 'F14' },
        ].map((preset) => (
          <button
            key={preset.code}
            className={`rounded-md border px-3 py-2 text-left transition ${
              holdKeyCode === preset.code
                ? 'border-mint bg-mint/14 text-mint'
                : 'border-white/10 bg-white/[0.04] text-ink hover:bg-white/[0.08]'
            }`}
            type="button"
            onClick={() => onHoldKeyChange(preset.code)}
          >
            <span className="block text-xs font-bold text-moss">{preset.label}</span>
            <span className="mt-1 block font-mono text-base font-black">{preset.code}</span>
          </button>
        ))}
      </div>

      {isFootPedalFriendly ? <p className="text-xs font-bold text-mint">{t.footPedalReady}</p> : null}
      {hasCompetingKeyWarning ? (
        <p className="rounded-md border border-coral/35 bg-coral/12 px-3 py-2 text-sm font-semibold text-[#ffb7a5]">
          {t.competingKeyWarning}
        </p>
      ) : null}

      <SliderField label={t.fade} value={fadeMs} min={50} max={150} suffix="ms" onChange={onFadeChange} />
    </div>
  );
}
