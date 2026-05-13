import { useEffect, useState } from 'react';
import { defaultPracticeText, metronomeTones, practiceCategories, practiceLibrary } from '../i18n';
import { feedbackPresets } from '../presets';
import type {
  AppSettings,
  FeedbackMode,
  FeedbackPresetId,
  MetronomeTone,
  OutputChannel,
  PracticeCategory,
} from '../types';

const storageKey = 'speech-practice-settings-v1';

const fallbackSettings: AppSettings = {
  language: 'ja',
  inputDeviceId: 'default',
  outputDeviceId: 'default',
  feedbackMode: 'daf',
  feedbackPreset: 'lightStart',
  delayMs: 120,
  feedbackVolume: 0.45,
  fafPitchSemitones: -2,
  outputChannel: 'both',
  holdToDafEnabled: false,
  holdKeyCode: 'F13',
  fadeMs: 100,
  paceMonitorEnabled: false,
  paceSensitivity: 55,
  bpm: 72,
  metronomeTone: 'softClick',
  practiceCategory: 'reading',
  practiceTextIndex: 0,
  practiceText: defaultPracticeText.ja,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const readNumber = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};
const isMetronomeTone = (value: unknown): value is MetronomeTone =>
  typeof value === 'string' && metronomeTones.includes(value as MetronomeTone);
const isPracticeCategory = (value: unknown): value is PracticeCategory =>
  typeof value === 'string' && practiceCategories.includes(value as PracticeCategory);
const isFeedbackMode = (value: unknown): value is FeedbackMode =>
  value === 'none' || value === 'daf' || value === 'faf' || value === 'dafFaf';
const isOutputChannel = (value: unknown): value is OutputChannel =>
  value === 'both' || value === 'left' || value === 'right';
const isFeedbackPreset = (value: unknown): value is FeedbackPresetId =>
  typeof value === 'string' && feedbackPresets.some((preset) => preset.id === value);

export function useStoredSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return fallbackSettings;
      }

      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      const language = parsed.language === 'en' ? 'en' : 'ja';
      const practiceCategory = isPracticeCategory(parsed.practiceCategory) ? parsed.practiceCategory : 'reading';
      const maxTextIndex = practiceLibrary[language][practiceCategory].length - 1;

      return {
        language,
        inputDeviceId: parsed.inputDeviceId || fallbackSettings.inputDeviceId,
        outputDeviceId: parsed.outputDeviceId || fallbackSettings.outputDeviceId,
        feedbackMode: isFeedbackMode(parsed.feedbackMode) ? parsed.feedbackMode : fallbackSettings.feedbackMode,
        feedbackPreset: isFeedbackPreset(parsed.feedbackPreset) ? parsed.feedbackPreset : fallbackSettings.feedbackPreset,
        delayMs: clamp(readNumber(parsed.delayMs, fallbackSettings.delayMs), 50, 250),
        feedbackVolume: clamp(readNumber(parsed.feedbackVolume, fallbackSettings.feedbackVolume), 0, 1),
        fafPitchSemitones: clamp(readNumber(parsed.fafPitchSemitones, fallbackSettings.fafPitchSemitones), -12, 12),
        outputChannel: isOutputChannel(parsed.outputChannel) ? parsed.outputChannel : fallbackSettings.outputChannel,
        holdToDafEnabled: Boolean(parsed.holdToDafEnabled ?? fallbackSettings.holdToDafEnabled),
        holdKeyCode: parsed.holdKeyCode || fallbackSettings.holdKeyCode,
        fadeMs: clamp(readNumber(parsed.fadeMs, fallbackSettings.fadeMs), 50, 150),
        paceMonitorEnabled: Boolean(parsed.paceMonitorEnabled ?? fallbackSettings.paceMonitorEnabled),
        paceSensitivity: clamp(readNumber(parsed.paceSensitivity, fallbackSettings.paceSensitivity), 0, 100),
        bpm: clamp(readNumber(parsed.bpm, fallbackSettings.bpm), 40, 180),
        metronomeTone: isMetronomeTone(parsed.metronomeTone) ? parsed.metronomeTone : fallbackSettings.metronomeTone,
        practiceCategory,
        practiceTextIndex: Math.floor(clamp(readNumber(parsed.practiceTextIndex, 0), 0, maxTextIndex)),
        practiceText: parsed.practiceText || defaultPracticeText[language],
      };
    } catch {
      return fallbackSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
}
