import { Gauge, TimerReset } from 'lucide-react';
import { SliderField } from './SliderField';
import { ToggleSwitch } from './ToggleSwitch';
import type { Language, PaceState, SpeakingPaceMetrics } from '../types';

type SpeakingPaceMonitorProps = {
  language: Language;
  enabled: boolean;
  sensitivity: number;
  metrics: SpeakingPaceMetrics;
  onEnabledChange: (value: boolean) => void;
  onSensitivityChange: (value: number) => void;
};

const labels = {
  ja: {
    title: 'Speaking Pace Monitor',
    description: '音声認識は使わず、マイク音量の変化だけで直近5秒の話す密度を見ます。',
    toggle: '早口検知',
    sensitivity: '感度',
    calm: 'Calm',
    good: 'Good Pace',
    fast: 'Fast',
    calmHint: 'ゆったりした間があります',
    goodHint: 'Good pace',
    fastHint: 'Take a breath',
    density: '発話密度',
    pauses: '間',
    peak: 'ピーク間隔',
    score: 'Pace Score',
    disabled: 'OFFにすると解析とFastログ記録を止めます。',
    localOnly: '音声データは保存しません。RMSから計算した指標だけをログに含めます。',
  },
  en: {
    title: 'Speaking Pace Monitor',
    description: 'No speech recognition. It estimates pace from microphone volume changes over the last 5 seconds.',
    toggle: 'Pace detection',
    sensitivity: 'Sensitivity',
    calm: 'Calm',
    good: 'Good Pace',
    fast: 'Fast',
    calmHint: 'There is room between phrases',
    goodHint: 'Good pace',
    fastHint: 'Take a breath',
    density: 'Speech density',
    pauses: 'Pauses',
    peak: 'Peak interval',
    score: 'Pace Score',
    disabled: 'Turn this off to stop analysis and Fast pace logging.',
    localOnly: 'Audio data is not saved. Only RMS-derived metrics are included in logs.',
  },
} satisfies Record<Language, Record<string, string>>;

const stateStyles: Record<PaceState, string> = {
  calm: 'border-white/10 bg-white/[0.045] text-ink',
  good: 'border-mint/50 bg-mint/12 text-mint',
  fast: 'border-coral/45 bg-coral/12 text-[#ffc7b8]',
};

const stateIconStyles: Record<PaceState, string> = {
  calm: 'bg-white/8 text-moss',
  good: 'bg-mint text-[#061412]',
  fast: 'bg-coral/24 text-[#ffc7b8]',
};

const formatPeakInterval = (value: number | null, language: Language) => {
  if (value === null) {
    return language === 'ja' ? '計測中' : 'Measuring';
  }

  return `${Math.round(value)}ms`;
};

export function SpeakingPaceMonitor({
  language,
  enabled,
  sensitivity,
  metrics,
  onEnabledChange,
  onSensitivityChange,
}: SpeakingPaceMonitorProps) {
  const t = labels[language];
  const stateLabel = metrics.state === 'calm' ? t.calm : metrics.state === 'good' ? t.good : t.fast;
  const stateHint = metrics.state === 'calm' ? t.calmHint : metrics.state === 'good' ? t.goodHint : t.fastHint;

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-ink">
            <Gauge size={17} aria-hidden />
            {t.title}
          </div>
          <p className="mt-1 text-xs font-medium leading-5 text-moss">{t.description}</p>
        </div>
        <div className="w-48">
          <ToggleSwitch checked={enabled} label={t.toggle} onChange={onEnabledChange} />
        </div>
      </div>

      <div className={`rounded-xl border p-4 ${stateStyles[enabled ? metrics.state : 'calm']}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`grid h-14 w-14 place-items-center rounded-xl ${stateIconStyles[enabled ? metrics.state : 'calm']}`}>
              <TimerReset size={27} aria-hidden />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-moss">{t.score}</div>
              <div className="text-3xl font-black">{enabled ? stateLabel : 'OFF'}</div>
              <div className="mt-1 text-sm font-bold text-moss">{enabled ? stateHint : t.disabled}</div>
            </div>
          </div>
          <div className="font-mono text-4xl font-black tabular-nums">{enabled ? metrics.paceScore : 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-[#0b1418] p-3">
          <div className="text-xs font-bold text-moss">{t.density}</div>
          <div className="mt-1 font-mono text-xl font-black text-ink">{Math.round(metrics.speechDensity * 100)}%</div>
        </div>
        <div className="rounded-lg bg-[#0b1418] p-3">
          <div className="text-xs font-bold text-moss">{t.pauses}</div>
          <div className="mt-1 font-mono text-xl font-black text-ink">{metrics.pauseCount}</div>
        </div>
        <div className="rounded-lg bg-[#0b1418] p-3">
          <div className="text-xs font-bold text-moss">{t.peak}</div>
          <div className="mt-1 font-mono text-xl font-black text-ink">{formatPeakInterval(metrics.averagePeakIntervalMs, language)}</div>
        </div>
      </div>

      <SliderField
        label={t.sensitivity}
        value={sensitivity}
        min={0}
        max={100}
        suffix="%"
        onChange={onSensitivityChange}
      />
      <p className="text-xs font-medium leading-5 text-moss">{t.localOnly}</p>
    </div>
  );
}
