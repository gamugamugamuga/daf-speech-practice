import { Play, Square } from 'lucide-react';
import { Button } from './Button';
import { Panel } from './Panel';
import { SelectField } from './SelectField';
import { SliderField } from './SliderField';
import { useMetronome } from '../hooks/useMetronome';
import type { Language, MetronomeTone } from '../types';
import { bpmPresetLabels, bpmPresets, copy, metronomeTones, toneLabels } from '../i18n';

type MetronomePanelProps = {
  language: Language;
  bpm: number;
  tone: MetronomeTone;
  outputDeviceId: string;
  onBpmChange: (value: number) => void;
  onToneChange: (value: MetronomeTone) => void;
};

export function MetronomePanel({ language, bpm, tone, outputDeviceId, onBpmChange, onToneChange }: MetronomePanelProps) {
  const t = copy[language];
  const metronome = useMetronome({ bpm, tone, outputDeviceId });

  return (
    <Panel title={t.metronome} description={t.metronomeDesc}>
      <div className="grid gap-6">
        <div className="grid grid-cols-[1fr_210px] gap-5">
          <SliderField label={t.bpm} value={bpm} min={40} max={180} suffix="" onChange={onBpmChange} />
          <SelectField label={t.tone} value={tone} onChange={(event) => onToneChange(event.target.value as MetronomeTone)}>
            {metronomeTones.map((item) => (
              <option key={item} value={item}>
                {toneLabels[language][item]}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="rounded-lg bg-paper/70 p-3">
          <div className="mb-2 text-xs font-black uppercase tracking-normal text-moss">{t.recommendedBpm}</div>
          <div className="grid grid-cols-5 gap-2">
            {bpmPresets.map((preset) => (
              <button
                key={preset}
                className={`rounded-md px-2 py-2 text-left transition ${
                  bpm === preset ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-mint/40'
                }`}
                type="button"
                onClick={() => onBpmChange(preset)}
              >
                <span className="block text-sm font-black tabular-nums">{preset}</span>
                <span className="mt-1 block text-[11px] font-semibold leading-4 opacity-80">
                  {bpmPresetLabels[language][preset]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/10 pt-4">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black tabular-nums text-ink">{bpm}</span>
            <span className="pb-1 text-sm font-bold text-moss">{t.bpm}</span>
          </div>
          {metronome.isRunning ? (
            <Button variant="danger" icon={<Square size={16} aria-hidden />} onClick={metronome.stop}>
              {t.stop}
            </Button>
          ) : (
            <Button variant="primary" icon={<Play size={17} aria-hidden />} onClick={metronome.start}>
              {t.start}
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
