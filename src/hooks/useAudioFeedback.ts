import { useCallback, useEffect, useRef, useState } from 'react';
import { applyAudioContextSink } from '../audioOutput';

type AudioFeedbackOptions = {
  inputDeviceId: string;
  outputDeviceId: string;
  delayMs: number;
  volume: number;
};

export function useAudioFeedback({ inputDeviceId, outputDeviceId, delayMs, volume }: AudioFeedbackOptions) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stop = useCallback(async () => {
    sourceRef.current?.disconnect();
    delayRef.current?.disconnect();
    gainRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    if (audioContextRef.current?.state !== 'closed') {
      await audioContextRef.current?.close();
    }

    sourceRef.current = null;
    delayRef.current = null;
    gainRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: inputDeviceId === 'default' ? undefined : { exact: inputDeviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new AudioContext();
      await applyAudioContextSink(audioContext, outputDeviceId);
      const source = audioContext.createMediaStreamSource(stream);
      const delay = audioContext.createDelay(1);
      const gain = audioContext.createGain();

      delay.delayTime.value = delayMs / 1000;
      gain.gain.value = volume;

      source.connect(delay);
      delay.connect(gain);
      gain.connect(audioContext.destination);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      delayRef.current = delay;
      gainRef.current = gain;
      setIsActive(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'microphone_error');
      setIsActive(false);
    }
  }, [delayMs, inputDeviceId, outputDeviceId, volume]);

  useEffect(() => {
    if (delayRef.current) {
      delayRef.current.delayTime.setTargetAtTime(delayMs / 1000, delayRef.current.context.currentTime, 0.015);
    }
  }, [delayMs]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, gainRef.current.context.currentTime, 0.015);
    }
  }, [volume]);

  useEffect(() => {
    if (audioContextRef.current) {
      void applyAudioContextSink(audioContextRef.current, outputDeviceId);
    }
  }, [outputDeviceId]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return { isActive, error, start, stop };
}
