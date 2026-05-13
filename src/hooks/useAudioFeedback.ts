import { useCallback, useEffect, useRef, useState } from 'react';
import { applyAudioContextSink } from '../audioOutput';
import { SpeakingPaceAnalyzer, defaultSpeakingPaceMetrics } from '../services/speakingPaceAnalyzer';
import type { FeedbackMode, OutputChannel } from '../types';

type AudioFeedbackOptions = {
  inputDeviceId: string;
  outputDeviceId: string;
  feedbackMode: FeedbackMode;
  delayMs: number;
  volume: number;
  fafPitchSemitones: number;
  outputChannel: OutputChannel;
  holdToDafEnabled: boolean;
  isHoldKeyPressed: boolean;
  fadeMs: number;
  paceMonitorEnabled: boolean;
  paceSensitivity: number;
};

const rampGain = (gain: GainNode, targetValue: number, fadeMs: number) => {
  const now = gain.context.currentTime;
  const fadeSeconds = Math.max(0.05, Math.min(0.15, fadeMs / 1000));

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(targetValue, now + fadeSeconds);
};

const setImmediateGain = (gain: GainNode | null, value: number) => {
  if (gain) {
    gain.gain.value = value;
  }
};

const pitchRatioFromSemitones = (semitones: number) => 2 ** (semitones / 12);

const panFromOutputChannel = (outputChannel: OutputChannel) => {
  if (outputChannel === 'left') {
    return -1;
  }

  if (outputChannel === 'right') {
    return 1;
  }

  return 0;
};

export function useAudioFeedback({
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
}: AudioFeedbackOptions) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paceMetrics, setPaceMetrics] = useState(defaultSpeakingPaceMetrics);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const paceFrameRef = useRef<number | null>(null);
  const paceBufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const paceAnalyzerRef = useRef(new SpeakingPaceAnalyzer());
  const paceMonitorEnabledRef = useRef(paceMonitorEnabled);
  const paceSensitivityRef = useRef(paceSensitivity);
  const lastPaceSampleAtRef = useRef(0);
  const dafPathGainRef = useRef<GainNode | null>(null);
  const fafPathGainRef = useRef<GainNode | null>(null);
  const dafFafPathGainRef = useRef<GainNode | null>(null);
  const fafNodeRef = useRef<AudioWorkletNode | null>(null);
  const dafFafNodeRef = useRef<AudioWorkletNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isHoldGateOpen = !holdToDafEnabled || isHoldKeyPressed;
  const isOutputEnabled = isHoldGateOpen && feedbackMode !== 'none';

  useEffect(() => {
    paceMonitorEnabledRef.current = paceMonitorEnabled;

    if (!paceMonitorEnabled) {
      paceAnalyzerRef.current.reset();
      setPaceMetrics(defaultSpeakingPaceMetrics);
    }
  }, [paceMonitorEnabled]);

  useEffect(() => {
    paceSensitivityRef.current = paceSensitivity;
  }, [paceSensitivity]);

  const cancelPaceLoop = useCallback(() => {
    if (paceFrameRef.current !== null) {
      cancelAnimationFrame(paceFrameRef.current);
    }

    paceFrameRef.current = null;
  }, []);

  const runPaceLoop = useCallback(() => {
    const analyser = analyserRef.current;

    if (!analyser) {
      paceFrameRef.current = null;
      return;
    }

    const nowMs = performance.now();
    if (nowMs - lastPaceSampleAtRef.current >= 90) {
      lastPaceSampleAtRef.current = nowMs;

      if (paceMonitorEnabledRef.current) {
        const buffer = paceBufferRef.current ?? new Float32Array(analyser.fftSize);
        paceBufferRef.current = buffer;
        analyser.getFloatTimeDomainData(buffer);

        const rms = Math.sqrt(buffer.reduce((total, sample) => total + sample * sample, 0) / buffer.length);
        setPaceMetrics(paceAnalyzerRef.current.push(rms, nowMs, paceSensitivityRef.current));
      }
    }

    paceFrameRef.current = requestAnimationFrame(runPaceLoop);
  }, []);

  const updatePathGains = useCallback(() => {
    setImmediateGain(dafPathGainRef.current, feedbackMode === 'daf' ? 1 : 0);
    setImmediateGain(fafPathGainRef.current, feedbackMode === 'faf' ? 1 : 0);
    setImmediateGain(dafFafPathGainRef.current, feedbackMode === 'dafFaf' ? 1 : 0);
  }, [feedbackMode]);

  const updatePitch = useCallback(() => {
    const ratio = pitchRatioFromSemitones(fafPitchSemitones);
    fafNodeRef.current?.parameters.get('pitchRatio')?.setTargetAtTime(
      ratio,
      fafNodeRef.current.context.currentTime,
      0.015,
    );
    dafFafNodeRef.current?.parameters.get('pitchRatio')?.setTargetAtTime(
      ratio,
      dafFafNodeRef.current.context.currentTime,
      0.015,
    );
  }, [fafPitchSemitones]);

  const stop = useCallback(async () => {
    cancelPaceLoop();
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    delayRef.current?.disconnect();
    outputGainRef.current?.disconnect();
    dafPathGainRef.current?.disconnect();
    fafPathGainRef.current?.disconnect();
    dafFafPathGainRef.current?.disconnect();
    fafNodeRef.current?.disconnect();
    dafFafNodeRef.current?.disconnect();
    pannerRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    if (audioContextRef.current?.state !== 'closed') {
      await audioContextRef.current?.close();
    }

    sourceRef.current = null;
    analyserRef.current = null;
    paceBufferRef.current = null;
    lastPaceSampleAtRef.current = 0;
    paceAnalyzerRef.current.reset();
    setPaceMetrics(defaultSpeakingPaceMetrics);
    delayRef.current = null;
    outputGainRef.current = null;
    dafPathGainRef.current = null;
    fafPathGainRef.current = null;
    dafFafPathGainRef.current = null;
    fafNodeRef.current = null;
    dafFafNodeRef.current = null;
    pannerRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    setIsActive(false);
  }, [cancelPaceLoop]);

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
      await audioContext.audioWorklet.addModule(`${import.meta.env.BASE_URL}pitch-shift-processor.js`);
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      const delay = audioContext.createDelay(1);
      const outputGain = audioContext.createGain();
      const dafPathGain = audioContext.createGain();
      const fafPathGain = audioContext.createGain();
      const dafFafPathGain = audioContext.createGain();
      const fafNode = new AudioWorkletNode(audioContext, 'pitch-shift-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      const dafFafNode = new AudioWorkletNode(audioContext, 'pitch-shift-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      const panner = audioContext.createStereoPanner();

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.22;
      delay.delayTime.value = delayMs / 1000;
      outputGain.gain.value = isOutputEnabled ? volume : 0;
      panner.pan.value = panFromOutputChannel(outputChannel);

      source.connect(analyser);
      source.connect(delay);
      delay.connect(dafPathGain);
      source.connect(fafNode);
      fafNode.connect(fafPathGain);
      delay.connect(dafFafNode);
      dafFafNode.connect(dafFafPathGain);
      dafPathGain.connect(panner);
      fafPathGain.connect(panner);
      dafFafPathGain.connect(panner);
      panner.connect(outputGain);
      outputGain.connect(audioContext.destination);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      analyserRef.current = analyser;
      delayRef.current = delay;
      outputGainRef.current = outputGain;
      dafPathGainRef.current = dafPathGain;
      fafPathGainRef.current = fafPathGain;
      dafFafPathGainRef.current = dafFafPathGain;
      fafNodeRef.current = fafNode;
      dafFafNodeRef.current = dafFafNode;
      pannerRef.current = panner;
      paceAnalyzerRef.current.reset();
      setPaceMetrics(defaultSpeakingPaceMetrics);
      lastPaceSampleAtRef.current = 0;
      cancelPaceLoop();
      runPaceLoop();
      updatePathGains();
      updatePitch();
      setIsActive(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'microphone_error');
      setIsActive(false);
    }
  }, [
    cancelPaceLoop,
    delayMs,
    inputDeviceId,
    isOutputEnabled,
    outputChannel,
    outputDeviceId,
    runPaceLoop,
    updatePathGains,
    updatePitch,
    volume,
  ]);

  useEffect(() => {
    if (delayRef.current) {
      delayRef.current.delayTime.setTargetAtTime(delayMs / 1000, delayRef.current.context.currentTime, 0.015);
    }
  }, [delayMs]);

  useEffect(() => {
    updatePathGains();
  }, [updatePathGains]);

  useEffect(() => {
    updatePitch();
  }, [updatePitch]);

  useEffect(() => {
    if (outputGainRef.current) {
      rampGain(outputGainRef.current, isOutputEnabled ? volume : 0, fadeMs);
    }
  }, [fadeMs, isOutputEnabled, volume]);

  useEffect(() => {
    if (pannerRef.current) {
      pannerRef.current.pan.setTargetAtTime(
        panFromOutputChannel(outputChannel),
        pannerRef.current.context.currentTime,
        0.015,
      );
    }
  }, [outputChannel]);

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

  const activeMode: FeedbackMode = isActive && isOutputEnabled ? feedbackMode : 'none';

  return {
    isActive,
    error,
    activeMode,
    isOutputEnabled: activeMode !== 'none',
    isDafOutputOn: activeMode === 'daf' || activeMode === 'dafFaf',
    isFafOutputOn: activeMode === 'faf' || activeMode === 'dafFaf',
    paceMetrics,
    start,
    stop,
  };
}
