import type { SelfEvaluationEntry, UsageLogEntry } from '../types';

const usageLogKey = 'speech-practice-usage-logs-v1';
const evaluationsKey = 'speech-practice-evaluations-v1';

const readList = <Item>(key: string): Item[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Item[]) : [];
  } catch {
    return [];
  }
};

const writeList = <Item>(key: string, value: Item[]) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const readUsageLogs = () => readList<UsageLogEntry>(usageLogKey);
export const readEvaluations = () => readList<SelfEvaluationEntry>(evaluationsKey);

export const saveUsageLog = (entry: UsageLogEntry) => {
  writeList(usageLogKey, [entry, ...readUsageLogs()].slice(0, 500));
};

export const saveEvaluation = (entry: SelfEvaluationEntry) => {
  writeList(evaluationsKey, [entry, ...readEvaluations()].slice(0, 500));
};

export const clearVerificationData = () => {
  localStorage.removeItem(usageLogKey);
  localStorage.removeItem(evaluationsKey);
};

const csvEscape = (value: unknown) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

export const buildCsvExport = (logs: UsageLogEntry[], evaluations: SelfEvaluationEntry[]) => {
  const logHeader = [
    'type',
    'id',
    'startedAt',
    'endedAt',
    'durationMs',
    'mode',
    'delayMs',
    'fafPitchSemitones',
    'volume',
    'holdModeEnabled',
    'outputChannel',
    'preset',
    'paceMonitorEnabled',
    'paceSensitivity',
    'fastPaceCount',
    'fastPaceDurationMs',
    'averagePaceScore',
    'startEase',
    'blockRelease',
    'discomfort',
    'practicality',
    'note',
  ];

  const logRows = logs.map((log) =>
    [
      'usage',
      log.id,
      log.startedAt,
      log.endedAt,
      log.durationMs,
      log.mode,
      log.delayMs,
      log.fafPitchSemitones,
      log.volume,
      log.holdModeEnabled,
      log.outputChannel,
      log.preset,
      log.paceMonitorEnabled ?? '',
      log.paceSensitivity ?? '',
      log.fastPaceCount ?? 0,
      log.fastPaceDurationMs ?? 0,
      log.averagePaceScore ?? '',
      '',
      '',
      '',
      '',
      '',
    ].map(csvEscape).join(','),
  );

  const evaluationRows = evaluations.map((evaluation) =>
    [
      'evaluation',
      evaluation.id,
      evaluation.createdAt,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      evaluation.fastPaceCount ?? 0,
      evaluation.fastPaceDurationMs ?? 0,
      '',
      evaluation.startEase,
      evaluation.blockRelease,
      evaluation.discomfort,
      evaluation.practicality,
      evaluation.note,
    ].map(csvEscape).join(','),
  );

  return [logHeader.join(','), ...logRows, ...evaluationRows].join('\n');
};

export const downloadTextFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
