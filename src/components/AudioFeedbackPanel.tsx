import { Mic, Square } from 'lucide-react';
import { Button } from './Button';
import { Panel } from './Panel';
import { SliderField } from './SliderField';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import type { Language } from '../types';
import { copy } from '../i18n';

type AudioFeedbackPanelProps = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
  delayMs: number;
  volume: number;
  onDelayChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
};

export function AudioFeedbackPanel({
  language,
  inputDeviceId,
  outputDeviceId,
  delayMs,
  volume,
  onDelayChange,
  onVolumeChange,
}: AudioFeedbackPanelProps) {
  const t = copy[language];
  const feedback = useAudioFeedback({ inputDeviceId, outputDeviceId, delayMs, volume });

  return (
    <Panel
      title={t.feedback}
      description={t.feedbackDesc}
      action={
        <span
          className={`rounded-md px-3 py-1.5 text-xs font-bold ${
            feedback.isActive ? 'bg-mint text-ink' : 'bg-paper text-moss'
          }`}
        >
          {feedback.isActive ? t.micActive : t.micInactive}
        </span>
      }
    >
      <div className="grid gap-6">
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

        <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-4">
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
          <p className="rounded-md bg-coral/15 px-3 py-2 text-sm font-semibold text-[#8b321f]">{t.microphoneError}</p>
        ) : null}
      </div>
    </Panel>
  );
}
