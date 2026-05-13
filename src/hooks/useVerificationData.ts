import { useCallback, useMemo, useState } from 'react';
import {
  buildCsvExport,
  clearVerificationData,
  downloadTextFile,
  readEvaluations,
  readUsageLogs,
  saveEvaluation,
  saveUsageLog,
} from '../services/logService';
import type { SelfEvaluationEntry, UsageLogEntry } from '../types';

export function useVerificationData() {
  const [logs, setLogs] = useState<UsageLogEntry[]>(() => readUsageLogs());
  const [evaluations, setEvaluations] = useState<SelfEvaluationEntry[]>(() => readEvaluations());

  const addUsageLog = useCallback((entry: UsageLogEntry) => {
    saveUsageLog(entry);
    setLogs(readUsageLogs());
  }, []);

  const addEvaluation = useCallback((entry: SelfEvaluationEntry) => {
    saveEvaluation(entry);
    setEvaluations(readEvaluations());
  }, []);

  const clearAll = useCallback(() => {
    clearVerificationData();
    setLogs([]);
    setEvaluations([]);
  }, []);

  const exportJson = useCallback(() => {
    downloadTextFile(
      `daf-faf-verification-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ logs, evaluations }, null, 2),
      'application/json',
    );
  }, [evaluations, logs]);

  const exportCsv = useCallback(() => {
    downloadTextFile(
      `daf-faf-verification-${new Date().toISOString().slice(0, 10)}.csv`,
      buildCsvExport(logs, evaluations),
      'text/csv;charset=utf-8',
    );
  }, [evaluations, logs]);

  return useMemo(
    () => ({ logs, evaluations, addUsageLog, addEvaluation, clearAll, exportJson, exportCsv }),
    [addEvaluation, addUsageLog, clearAll, evaluations, exportCsv, exportJson, logs],
  );
}
