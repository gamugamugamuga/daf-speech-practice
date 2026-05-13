import { Mic, Square } from 'lucide-react';
import { Button } from './Button';
import { HoldToDafSettings } from './HoldToDafSettings';
import { Panel } from './Panel';
import { SliderField } from './SliderField';
import { StatusIndicator } from './StatusIndicator';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import type { Language } from '../types';
import { copy } from '../i18n';

type AudioFeedbackPanelProps = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
  delayMs: number;
  volume: number;
  holdToDafEnabled: boolean;
  holdKeyCode: string;
  formattedHoldKey: string;
  fadeMs: number;
  isHoldKeyPressed: boolean;
  isRecordingKey: boolean;
  hasCompetingKeyWarning: boolean;
  isFootPedalFriendly: boolean;
  isGlobalInputAvailable: boolean;
  isGlobalInputMapped: boolean;
  onDelayChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onHoldToDafEnabledChange: (value: boolean) => void;
  onFadeChange: (value: number) => void;
  onHoldKeyChange: (value: string) => void;
  onStartKeyRecording: () => void;
  onCancelKeyRecording: () => void;
};

export function AudioFeedbackPanel({
  language,
  inputDeviceId,
  outputDeviceId,
  delayMs,
  volume,
  holdToDafEnabled,
  holdKeyCode,
  formattedHoldKey,
  fadeMs,
  isHoldKeyPressed,
  isRecordingKey,
  hasCompetingKeyWarning,
  isFootPedalFriendly,
  isGlobalInputAvailable,
  isGlobalInputMapped,
  onDelayChange,
  onVolumeChange,
  onHoldToDafEnabledChange,
  onFadeChange,
  onHoldKeyChange,
  onStartKeyRecording,
  onCancelKeyRecording,
}: AudioFeedbackPanelProps) {
  const t = copy[language];
  const feedback = useAudioFeedback({
    inputDeviceId,
    outputDeviceId,
    delayMs,
    volume,
    holdToDafEnabled,
    isHoldKeyPressed,
    fadeMs,
  });

  return (
    <Panel
      title={t.feedback}
      description={t.feedbackDesc}
      action={
        <span
          className={`rounded-md px-3 py-1.5 text-xs font-bold ${
            feedback.isActive ? 'bg-mint text-[#061412]' : 'bg-white/8 text-moss'
          }`}
        >
          {feedback.isActive ? t.micActive : t.micInactive}
        </span>
      }
    >
      <div className="grid gap-6">
        <StatusIndicator
          language={language}
          isMicActive={feedback.isActive}
          isDafOutputOn={feedback.isOutputEnabled}
          holdToDafEnabled={holdToDafEnabled}
          isHoldKeyPressed={isHoldKeyPressed}
          formattedHoldKey={formattedHoldKey}
        />

        <HoldToDafSettings
          language={language}
          enabled={holdToDafEnabled}
          holdKeyCode={holdKeyCode}
          formattedHoldKey={formattedHoldKey}
          fadeMs={fadeMs}
          isRecordingKey={isRecordingKey}
          hasCompetingKeyWarning={hasCompetingKeyWarning}
          isFootPedalFriendly={isFootPedalFriendly}
          isGlobalInputAvailable={isGlobalInputAvailable}
          isGlobalInputMapped={isGlobalInputMapped}
          onEnabledChange={onHoldToDafEnabledChange}
          onFadeChange={onFadeChange}
          onHoldKeyChange={onHoldKeyChange}
          onStartKeyRecording={onStartKeyRecording}
          onCancelKeyRecording={onCancelKeyRecording}
        />

        <div className="grid grid-cols-2 gap-5">
          <SliderField label={t.delay} value={delayMs} min={50} max={250} suffix="ms" onChange={onDelayChange} />
          <SliderField
            label={t.volume}
            value={Math.round(volume * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => onVolumeChange(value / 100)}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <p className="text-xs font-medium leading-5 text-moss">{t.localOnly}</p>
          {feedback.isActive ? (
            <Button variant="danger" icon={<Square size={16} aria-hidden />} onClick={() => void feedback.stop()}>
              {t.stopMic}
            </Button>
          ) : (
            <Button variant="primary" icon={<Mic size={17} aria-hidden />} onClick={() => void feedback.start()}>
              {t.startMic}
            </Button>
          )}
        </div>

        {feedback.error ? (
          <p className="rounded-md bg-coral/15 px-3 py-2 text-sm font-semibold text-[#ffb7a5]">{t.microphoneError}</p>
        ) : null}
      </div>
    </Panel>
  );
}
