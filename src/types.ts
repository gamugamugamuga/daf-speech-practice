export type Language = 'ja' | 'en';

export type MetronomeTone = 'softClick' | 'woodBlock' | 'beep' | 'bell' | 'lowTick';

export type PracticeCategory = 'greetings' | 'introduction' | 'phone' | 'ordering' | 'smallTalk' | 'reading' | 'firstVoice';

export type FeedbackMode = 'none' | 'daf' | 'faf' | 'dafFaf';

export type OutputChannel = 'both' | 'left' | 'right';

export type FeedbackPresetId = 'lightStart' | 'strongStart' | 'fafLowVoice' | 'dafFaf' | 'testMode';

export type PaceState = 'calm' | 'good' | 'fast';

export type SpeakingPaceMetrics = {
  speechDensity: number;
  pauseCount: number;
  averagePeakIntervalMs: number | null;
  paceScore: number;
  averagePaceScore: number;
  state: PaceState;
  fastEventCount: number;
  fastDurationMs: number;
};

export type AppSettings = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
  feedbackMode: FeedbackMode;
  feedbackPreset: FeedbackPresetId;
  delayMs: number;
  feedbackVolume: number;
  fafPitchSemitones: number;
  outputChannel: OutputChannel;
  holdToDafEnabled: boolean;
  holdKeyCode: string;
  fadeMs: number;
  paceMonitorEnabled: boolean;
  paceSensitivity: number;
  bpm: number;
  metronomeTone: MetronomeTone;
  practiceCategory: PracticeCategory;
  practiceTextIndex: number;
  practiceText: string;
};

export type RecorderStatus = 'idle' | 'recording' | 'ready';

export type UsageLogEntry = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  mode: FeedbackMode;
  delayMs: number;
  fafPitchSemitones: number;
  volume: number;
  holdModeEnabled: boolean;
  outputChannel: OutputChannel;
  preset: FeedbackPresetId;
  paceMonitorEnabled: boolean;
  paceSensitivity: number;
  fastPaceCount: number;
  fastPaceDurationMs: number;
  averagePaceScore: number;
};

export type SelfEvaluationEntry = {
  id: string;
  createdAt: string;
  logId?: string;
  startEase: number;
  blockRelease: number;
  discomfort: number;
  practicality: number;
  fastPaceCount: number;
  fastPaceDurationMs: number;
  note: string;
};
