import { useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from './Button';
import { HoldToDafSettings } from './HoldToDafSettings';
import { Panel } from './Panel';
import { SelectField } from './SelectField';
import { SliderField } from './SliderField';
import { StatusIndicator } from './StatusIndicator';
import { SpeakingPaceMonitor } from './SpeakingPaceMonitor';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import { feedbackPresets } from '../presets';
import type { FeedbackMode, FeedbackPresetId, Language, OutputChannel, UsageLogEntry } from '../types';
import { copy } from '../i18n';

type AudioFeedbackPanelProps = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
  feedbackMode: FeedbackMode;
  feedbackPreset: FeedbackPresetId;
  delayMs: number;
  volume: number;
  fafPitchSemitones: number;
  outputChannel: OutputChannel;
  holdToDafEnabled: boolean;
  holdKeyCode: string;
  formattedHoldKey: string;
  fadeMs: number;
  paceMonitorEnabled: boolean;
  paceSensitivity: number;
  isHoldKeyPressed: boolean;
  isRecordingKey: boolean;
  hasCompetingKeyWarning: boolean;
  isFootPedalFriendly: boolean;
  isGlobalInputAvailable: boolean;
  isGlobalInputMapped: boolean;
  onDelayChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onFeedbackModeChange: (value: FeedbackMode) => void;
  onPresetChange: (value: FeedbackPresetId) => void;
  onApplyPreset: (value: FeedbackPresetId) => void;
  onFafPitchChange: (value: number) => void;
  onOutputChannelChange: (value: OutputChannel) => void;
  onHoldToDafEnabledChange: (value: boolean) => void;
  onFadeChange: (value: number) => void;
  onPaceMonitorEnabledChange: (value: boolean) => void;
  onPaceSensitivityChange: (value: number) => void;
  onHoldKeyChange: (value: string) => void;
  onStartKeyRecording: () => void;
  onCancelKeyRecording: () => void;
  onUsageLog: (entry: UsageLogEntry) => void;
};

export function AudioFeedbackPanel({
  language,
  inputDeviceId,
  outputDeviceId,
  feedbackMode,
  feedbackPreset,
  delayMs,
  volume,
  fafPitchSemitones,
  outputChannel,
  holdToDafEnabled,
  holdKeyCode,
  formattedHoldKey,
  fadeMs,
  paceMonitorEnabled,
  paceSensitivity,
  isHoldKeyPressed,
  isRecordingKey,
  hasCompetingKeyWarning,
  isFootPedalFriendly,
  isGlobalInputAvailable,
  isGlobalInputMapped,
  onDelayChange,
  onVolumeChange,
  onFeedbackModeChange,
  onPresetChange,
  onApplyPreset,
  onFafPitchChange,
  onOutputChannelChange,
  onHoldToDafEnabledChange,
  onFadeChange,
  onPaceMonitorEnabledChange,
  onPaceSensitivityChange,
  onHoldKeyChange,
  onStartKeyRecording,
  onCancelKeyRecording,
  onUsageLog,
}: AudioFeedbackPanelProps) {
  const t = copy[language];
  const sessionRef = useRef<{
    startedAt: number;
    mode: FeedbackMode;
    delayMs: number;
    fafPitchSemitones: number;
    volume: number;
    holdModeEnabled: boolean;
    outputChannel: OutputChannel;
    preset: FeedbackPresetId;
    paceMonitorEnabled: boolean;
    paceSensitivity: number;
    fastPaceCountStart: number;
    fastPaceDurationStart: number;
  } | null>(null);
  const feedback = useAudioFeedback({
    inputDeviceId,
    outputDeviceId,
    feedbackMode,
    delayMs,
    volume,
    fafPitchSemitones,
    outputChannel,
    holdToDafEnabled,
    isHoldKeyPressed,
    fadeMs,
    paceMonitorEnabled,
    paceSensitivity,
  });
  const paceMetricsRef = useRef(feedback.paceMetrics);

  useEffect(() => {
    paceMetricsRef.current = feedback.paceMetrics;
  }, [feedback.paceMetrics]);

  useEffect(() => {
    const finishSession = () => {
      const session = sessionRef.current;
      if (!session) {
        return;
      }

      const endedAt = Date.now();
      const paceMetrics = paceMetricsRef.current;
      const fastPaceCount = Math.max(0, paceMetrics.fastEventCount - session.fastPaceCountStart);
      const fastPaceDurationMs = Math.max(
        0,
        paceMetrics.fastDurationMs - session.fastPaceDurationStart,
      );

      sessionRef.current = null;
      onUsageLog({
        id: `${session.startedAt}-${Math.random().toString(36).slice(2, 8)}`,
        startedAt: new Date(session.startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        durationMs: endedAt - session.startedAt,
        mode: session.mode,
        delayMs: session.delayMs,
        fafPitchSemitones: session.fafPitchSemitones,
        volume: session.volume,
        holdModeEnabled: session.holdModeEnabled,
        outputChannel: session.outputChannel,
        preset: session.preset,
        paceMonitorEnabled: session.paceMonitorEnabled,
        paceSensitivity: session.paceSensitivity,
        fastPaceCount,
        fastPaceDurationMs,
        averagePaceScore: paceMetrics.averagePaceScore,
      });
    };

    if (feedback.activeMode === 'none') {
      finishSession();
      return;
    }

    if (sessionRef.current?.mode !== feedback.activeMode) {
      finishSession();
      sessionRef.current = {
        startedAt: Date.now(),
        mode: feedback.activeMode,
        delayMs,
        fafPitchSemitones,
        volume,
        holdModeEnabled: holdToDafEnabled,
        outputChannel,
        preset: feedbackPreset,
        paceMonitorEnabled,
        paceSensitivity,
        fastPaceCountStart: paceMetricsRef.current.fastEventCount,
        fastPaceDurationStart: paceMetricsRef.current.fastDurationMs,
      };
    }

    return finishSession;
  }, [
    delayMs,
    fafPitchSemitones,
    feedback.activeMode,
    feedbackPreset,
    holdToDafEnabled,
    onUsageLog,
    outputChannel,
    paceMonitorEnabled,
    paceSensitivity,
    volume,
  ]);

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
          activeMode={feedback.activeMode}
          holdToDafEnabled={holdToDafEnabled}
          isHoldKeyPressed={isHoldKeyPressed}
          formattedHoldKey={formattedHoldKey}
        />

        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <SelectField
            label={t.feedbackMode}
            value={feedbackMode}
            onChange={(event) => onFeedbackModeChange(event.target.value as FeedbackMode)}
          >
            <option value="none">{t.modeNone}</option>
            <option value="daf">{t.modeDaf}</option>
            <option value="faf">{t.modeFaf}</option>
            <option value="dafFaf">{t.modeDafFaf}</option>
          </SelectField>
          <SelectField
            label={t.preset}
            value={feedbackPreset}
            onChange={(event) => onPresetChange(event.target.value as FeedbackPresetId)}
          >
            {feedbackPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </SelectField>
          <Button variant="secondary" onClick={() => onApplyPreset(feedbackPreset)}>
            {t.applyPreset}
          </Button>
        </div>

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
          <SliderField
            label={t.fafPitch}
            value={fafPitchSemitones}
            min={-12}
            max={12}
            suffix=" st"
            onChange={onFafPitchChange}
          />
          <SelectField
            label={t.outputChannel}
            value={outputChannel}
            onChange={(event) => onOutputChannelChange(event.target.value as OutputChannel)}
          >
            <option value="both">{t.outputBoth}</option>
            <option value="left">{t.outputLeft}</option>
            <option value="right">{t.outputRight}</option>
          </SelectField>
        </div>

        <SpeakingPaceMonitor
          language={language}
          enabled={paceMonitorEnabled}
          sensitivity={paceSensitivity}
          metrics={feedback.paceMetrics}
          onEnabledChange={onPaceMonitorEnabledChange}
          onSensitivityChange={onPaceSensitivityChange}
        />

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
