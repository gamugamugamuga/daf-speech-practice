import { useCallback, useEffect, useRef, useState } from 'react';
import { applyAudioContextSink } from '../audioOutput';
import type { MetronomeTone } from '../types';

type MetronomeOptions = {
  bpm: number;
  tone: MetronomeTone;
  outputDeviceId: string;
};

export function useMetronome({ bpm, tone, outputDeviceId }: MetronomeOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = null;
  }, []);

  const ensureAudioContext = useCallback(async () => {
    const audioContext = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = audioContext;
    await applyAudioContextSink(audioContext, outputDeviceId);
    return audioContext;
  }, [outputDeviceId]);

  const tick = useCallback(async () => {
    const audioContext = await ensureAudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const now = audioContext.currentTime;

    filter.type = 'bandpass';

    if (tone === 'woodBlock') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(620, now);
      filter.frequency.setValueAtTime(920, now);
      filter.Q.setValueAtTime(9, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    } else if (tone === 'beep') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1040, now);
      filter.frequency.setValueAtTime(1040, now);
      filter.Q.setValueAtTime(3, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else if (tone === 'bell') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1320, now);
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(5, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    } else if (tone === 'lowTick') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(280, now);
      filter.frequency.setValueAtTime(430, now);
      filter.Q.setValueAtTime(7, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(2.5, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.26);
  }, [ensureAudioContext, tone]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    void tick();
    setIsRunning(true);
  }, [clearTimer, tick]);

  useEffect(() => {
    if (isRunning) {
      clearTimer();
      const intervalMs = (60 / bpm) * 1000;
      intervalRef.current = window.setInterval(() => void tick(), intervalMs);
    }
  }, [bpm, clearTimer, isRunning, tick]);

  useEffect(() => {
    return () => {
      stop();
      void audioContextRef.current?.close();
    };
  }, [stop]);

  return { isRunning, start, stop };
}
