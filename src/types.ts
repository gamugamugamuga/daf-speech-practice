export type Language = 'ja' | 'en';

export type MetronomeTone = 'softClick' | 'woodBlock' | 'beep' | 'bell' | 'lowTick';

export type PracticeCategory = 'greetings' | 'introduction' | 'phone' | 'ordering' | 'smallTalk' | 'reading' | 'firstVoice';

export type AppSettings = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
  delayMs: number;
  feedbackVolume: number;
  bpm: number;
  metronomeTone: MetronomeTone;
  practiceCategory: PracticeCategory;
  practiceTextIndex: number;
  practiceText: string;
};

export type RecorderStatus = 'idle' | 'recording' | 'ready';
