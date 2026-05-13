import type { FeedbackMode, FeedbackPresetId } from './types';

export type FeedbackPreset = {
  id: FeedbackPresetId;
  name: string;
  mode: FeedbackMode;
  delayMs: number;
  volume: number;
  fafPitchSemitones: number;
};

export const feedbackPresets: FeedbackPreset[] = [
  {
    id: 'lightStart',
    name: 'Light Start Assist',
    mode: 'daf',
    delayMs: 50,
    volume: 0.28,
    fafPitchSemitones: 0,
  },
  {
    id: 'strongStart',
    name: 'Strong Start Assist',
    mode: 'daf',
    delayMs: 80,
    volume: 0.48,
    fafPitchSemitones: 0,
  },
  {
    id: 'fafLowVoice',
    name: 'FAF Low Voice',
    mode: 'faf',
    delayMs: 0,
    volume: 0.35,
    fafPitchSemitones: -2,
  },
  {
    id: 'dafFaf',
    name: 'DAF + FAF',
    mode: 'dafFaf',
    delayMs: 70,
    volume: 0.38,
    fafPitchSemitones: -2,
  },
  {
    id: 'testMode',
    name: 'Test Mode',
    mode: 'none',
    delayMs: 70,
    volume: 0.3,
    fafPitchSemitones: -2,
  },
];

export const getPreset = (id: FeedbackPresetId) =>
  feedbackPresets.find((preset) => preset.id === id) ?? feedbackPresets[0];
