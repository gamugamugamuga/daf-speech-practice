type SinkTarget = HTMLMediaElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

type SinkAudioContext = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

export async function applyMediaElementSink(element: HTMLMediaElement, outputDeviceId: string) {
  const target = element as SinkTarget;

  if (!target.setSinkId) {
    return;
  }

  await target.setSinkId(outputDeviceId === 'default' ? '' : outputDeviceId);
}

export async function applyAudioContextSink(audioContext: AudioContext, outputDeviceId: string) {
  const target = audioContext as SinkAudioContext;

  if (!target.setSinkId) {
    return;
  }

  await target.setSinkId(outputDeviceId === 'default' ? '' : outputDeviceId);
}
