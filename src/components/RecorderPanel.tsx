import { useEffect, useRef } from 'react';
import { Play, Radio, Square } from 'lucide-react';
import { applyMediaElementSink } from '../audioOutput';
import { Button } from './Button';
import { Panel } from './Panel';
import { useRecorder } from '../hooks/useRecorder';
import type { Language } from '../types';
import { copy } from '../i18n';

type RecorderPanelProps = {
  language: Language;
  inputDeviceId: string;
  outputDeviceId: string;
};

export function RecorderPanel({ language, inputDeviceId, outputDeviceId }: RecorderPanelProps) {
  const t = copy[language];
  const recorder = useRecorder({ inputDeviceId, outputDeviceId });
  const isRecording = recorder.status === 'recording';
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioElementRef.current) {
      void applyMediaElementSink(audioElementRef.current, outputDeviceId);
    }
  }, [outputDeviceId, recorder.audioUrl]);

  return (
    <Panel title={t.recorder} description={t.recorderDesc}>
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`rounded-md px-3 py-1.5 text-xs font-bold ${
              isRecording ? 'bg-coral/25 text-[#8b321f]' : 'bg-paper text-moss'
            }`}
          >
            {isRecording ? t.recording : recorder.audioUrl ? t.play : t.noRecording}
          </span>
          <div className="flex items-center gap-2">
            {isRecording ? (
              <Button variant="danger" icon={<Square size={16} aria-hidden />} onClick={recorder.stop}>
                {t.stopRecording}
              </Button>
            ) : (
              <Button variant="primary" icon={<Radio size={17} aria-hidden />} onClick={() => void recorder.start()}>
                {t.record}
              </Button>
            )}
            <Button
              variant="secondary"
              icon={<Play size={17} aria-hidden />}
              onClick={() => void recorder.play()}
              disabled={!recorder.audioUrl || isRecording}
            >
              {t.play}
            </Button>
          </div>
        </div>

        {recorder.audioUrl ? (
          <audio ref={audioElementRef} className="w-full" controls src={recorder.audioUrl}>
            {t.play}
          </audio>
        ) : (
          <div className="grid h-14 place-items-center rounded-md border border-dashed border-black/15 bg-paper/60 text-sm font-semibold text-moss">
            {t.noRecording}
          </div>
        )}

        {recorder.error ? (
          <p className="rounded-md bg-coral/15 px-3 py-2 text-sm font-semibold text-[#8b321f]">{t.recorderError}</p>
        ) : null}
      </div>
    </Panel>
  );
}
