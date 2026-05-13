import type { PaceState, SpeakingPaceMetrics } from '../types';

type PaceSample = {
  timeMs: number;
  rms: number;
  speaking: boolean;
};

const windowMs = 5000;
const pauseMs = 300;
const minPeakGapMs = 220;

export const defaultSpeakingPaceMetrics: SpeakingPaceMetrics = {
  speechDensity: 0,
  pauseCount: 0,
  averagePeakIntervalMs: null,
  paceScore: 0,
  averagePaceScore: 0,
  state: 'calm',
  fastEventCount: 0,
  fastDurationMs: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const thresholdFromSensitivity = (sensitivity: number) => {
  const normalized = clamp(sensitivity, 0, 100) / 100;
  return 0.06 - normalized * 0.047;
};

const countPauses = (samples: PaceSample[], nowMs: number) => {
  let pauseCount = 0;
  let silenceStart: number | null = null;

  samples.forEach((sample) => {
    if (!sample.speaking && silenceStart === null) {
      silenceStart = sample.timeMs;
    }

    if (sample.speaking && silenceStart !== null) {
      if (sample.timeMs - silenceStart >= pauseMs) {
        pauseCount += 1;
      }
      silenceStart = null;
    }
  });

  if (silenceStart !== null && nowMs - silenceStart >= pauseMs) {
    pauseCount += 1;
  }

  return pauseCount;
};

const averageInterval = (times: number[]) => {
  if (times.length < 2) {
    return null;
  }

  const intervals = times.slice(1).map((time, index) => time - times[index]);
  return intervals.reduce((total, interval) => total + interval, 0) / intervals.length;
};

const scorePace = (speechDensity: number, pauseCount: number, averagePeakIntervalMs: number | null) => {
  const densityScore = speechDensity * 64;
  const pauseRelief = clamp(pauseCount / 4, 0, 1);
  const pauseScore = (1 - pauseRelief) * 24;
  const peakScore =
    averagePeakIntervalMs === null
      ? 4
      : averagePeakIntervalMs < 320
        ? 12
        : averagePeakIntervalMs < 460
          ? 9
          : averagePeakIntervalMs < 650
            ? 4
            : 0;

  return Math.round(clamp(densityScore + pauseScore + peakScore, 0, 100));
};

const classifyPace = (
  speechDensity: number,
  pauseCount: number,
  averagePeakIntervalMs: number | null,
  paceScore: number,
): PaceState => {
  const peakFeelsFast = averagePeakIntervalMs === null || averagePeakIntervalMs < 460;

  if ((speechDensity >= 0.72 && pauseCount <= 1 && peakFeelsFast) || paceScore >= 72) {
    return 'fast';
  }

  if (speechDensity <= 0.34 || pauseCount >= 4 || paceScore <= 36) {
    return 'calm';
  }

  return 'good';
};

export class SpeakingPaceAnalyzer {
  private samples: PaceSample[] = [];
  private peakTimes: number[] = [];
  private lastRms = 0;
  private lastPeakTime = -Infinity;
  private lastUpdateTime: number | null = null;
  private lastState: PaceState = 'calm';
  private fastEventCount = 0;
  private fastDurationMs = 0;
  private paceScoreTotal = 0;
  private paceScoreCount = 0;

  reset() {
    this.samples = [];
    this.peakTimes = [];
    this.lastRms = 0;
    this.lastPeakTime = -Infinity;
    this.lastUpdateTime = null;
    this.lastState = 'calm';
    this.fastEventCount = 0;
    this.fastDurationMs = 0;
    this.paceScoreTotal = 0;
    this.paceScoreCount = 0;
  }

  push(rms: number, nowMs: number, sensitivity: number): SpeakingPaceMetrics {
    const threshold = thresholdFromSensitivity(sensitivity);
    const speaking = rms >= threshold;
    const sample: PaceSample = { timeMs: nowMs, rms, speaking };

    this.samples.push(sample);
    this.samples = this.samples.filter((item) => nowMs - item.timeMs <= windowMs);
    this.peakTimes = this.peakTimes.filter((time) => nowMs - time <= windowMs);

    const peakThreshold = threshold * 1.75;
    const isPeak = speaking && rms >= peakThreshold && rms >= this.lastRms && nowMs - this.lastPeakTime >= minPeakGapMs;
    if (isPeak) {
      this.peakTimes.push(nowMs);
      this.lastPeakTime = nowMs;
    }

    this.lastRms = rms;

    if (this.samples.length < 8) {
      return {
        ...defaultSpeakingPaceMetrics,
        fastEventCount: this.fastEventCount,
        fastDurationMs: this.fastDurationMs,
      };
    }

    const speechDensity = this.samples.filter((item) => item.speaking).length / this.samples.length;
    const pauseCount = countPauses(this.samples, nowMs);
    const averagePeakIntervalMs = averageInterval(this.peakTimes);
    const paceScore = scorePace(speechDensity, pauseCount, averagePeakIntervalMs);
    const state = classifyPace(speechDensity, pauseCount, averagePeakIntervalMs, paceScore);

    const elapsedMs = this.lastUpdateTime === null ? 0 : Math.min(nowMs - this.lastUpdateTime, 300);
    if (state === 'fast') {
      if (this.lastState !== 'fast') {
        this.fastEventCount += 1;
      }
      this.fastDurationMs += elapsedMs;
    }

    this.lastUpdateTime = nowMs;
    this.lastState = state;
    this.paceScoreTotal += paceScore;
    this.paceScoreCount += 1;

    return {
      speechDensity,
      pauseCount,
      averagePeakIntervalMs,
      paceScore,
      averagePaceScore: Math.round(this.paceScoreTotal / this.paceScoreCount),
      state,
      fastEventCount: this.fastEventCount,
      fastDurationMs: Math.round(this.fastDurationMs),
    };
  }
}
