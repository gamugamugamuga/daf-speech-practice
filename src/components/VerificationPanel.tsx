import { Download, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { copy } from '../i18n';
import type { Language, SelfEvaluationEntry, UsageLogEntry } from '../types';
import { Button } from './Button';
import { Panel } from './Panel';

type VerificationPanelProps = {
  language: Language;
  logs: UsageLogEntry[];
  onEvaluationSave: (entry: SelfEvaluationEntry) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onClear: () => void;
};

const RatingField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="grid gap-2">
    <div className="text-sm font-bold text-ink">{label}</div>
    <div className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <button
          key={item}
          className={`h-10 rounded-md text-sm font-black transition ${
            value === item ? 'bg-mint text-[#061412]' : 'bg-white/8 text-ink hover:bg-white/12'
          }`}
          type="button"
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

export function VerificationPanel({
  language,
  logs,
  onEvaluationSave,
  onExportJson,
  onExportCsv,
  onClear,
}: VerificationPanelProps) {
  const t = copy[language];
  const fastPaceLabel = language === 'ja' ? 'Fast判定' : 'Fast pace';
  const [startEase, setStartEase] = useState(3);
  const [blockRelease, setBlockRelease] = useState(3);
  const [discomfort, setDiscomfort] = useState(3);
  const [practicality, setPracticality] = useState(3);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    const latestLog = logs[0];

    onEvaluationSave({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      logId: latestLog?.id,
      startEase,
      blockRelease,
      discomfort,
      practicality,
      fastPaceCount: latestLog?.fastPaceCount ?? 0,
      fastPaceDurationMs: latestLog?.fastPaceDurationMs ?? 0,
      note,
    });
    setSaved(true);
    setNote('');
  };

  return (
    <Panel title={t.logPanel} description={t.logPanelDesc}>
      <div className="grid gap-5">
        <div className="grid grid-cols-2 gap-4">
          <RatingField label={t.startEase} value={startEase} onChange={setStartEase} />
          <RatingField label={t.blockRelease} value={blockRelease} onChange={setBlockRelease} />
          <RatingField label={t.discomfort} value={discomfort} onChange={setDiscomfort} />
          <RatingField label={t.practicality} value={practicality} onChange={setPracticality} />
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-ink">{t.note}</span>
          <textarea
            className="min-h-24 rounded-lg border border-white/10 bg-[#0b1418] p-3 text-sm font-semibold text-ink outline-none transition focus:border-mint focus:ring-4 focus:ring-mint/20"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" icon={<Save size={17} aria-hidden />} onClick={save}>
            {t.saveEvaluation}
          </Button>
          <Button variant="secondary" icon={<Download size={17} aria-hidden />} onClick={onExportJson}>
            {t.exportJson}
          </Button>
          <Button variant="secondary" icon={<Download size={17} aria-hidden />} onClick={onExportCsv}>
            {t.exportCsv}
          </Button>
          <Button variant="ghost" icon={<Trash2 size={17} aria-hidden />} onClick={onClear}>
            {t.clearData}
          </Button>
          {saved ? <span className="text-sm font-bold text-mint">{t.evaluationSaved}</span> : null}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 text-sm font-black text-ink">{t.latestLogs}</div>
          {logs.length === 0 ? (
            <div className="text-sm font-semibold text-moss">{t.noLogs}</div>
          ) : (
            <div className="grid max-h-48 gap-2 overflow-auto">
              {logs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-md bg-[#0b1418] px-3 py-2 text-sm"
                >
                  <div className="font-bold text-ink">
                    {log.mode} / {log.preset}
                    <div className="text-xs font-semibold text-moss">{new Date(log.startedAt).toLocaleString()}</div>
                    <div className="text-xs font-semibold text-moss">
                      {fastPaceLabel} {log.fastPaceCount ?? 0} / {Math.round((log.fastPaceDurationMs ?? 0) / 1000)}
                      {t.seconds}
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-mint">
                    {Math.round(log.durationMs / 1000)}
                    {t.seconds}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
