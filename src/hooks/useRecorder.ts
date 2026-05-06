import { useCallback, useEffect, useRef, useState } from 'react';
import { applyMediaElementSink } from '../audioOutput';
import type { RecorderStatus } from '../types';

type RecorderOptions = {
  inputDeviceId: string;
  outputDeviceId: string;
};

export function useRecorder({ inputDeviceId, outputDeviceId }: RecorderOptions) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: inputDeviceId === 'default' ? undefined : { exact: inputDeviceId },
        },
      });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        setStatus('ready');
      };

      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'recorder_error');
      setStatus('idle');
    }
  }, [audioUrl, inputDeviceId]);

  const play = useCallback(async () => {
    if (!audioUrl) {
      return;
    }

    const audio = new Audio(audioUrl);
    await applyMediaElementSink(audio, outputDeviceId);
    audioRef.current = audio;
    void audio.play();
  }, [audioUrl, outputDeviceId]);

  useEffect(() => {
    return () => {
      recorderRef.current?.state === 'recording' && recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioRef.current?.pause();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return { status, audioUrl, error, start, stop, play };
}
