import { Activity, Footprints, RadioTower } from 'lucide-react';
import type { Language } from '../types';
import { copy } from '../i18n';

type StatusIndicatorProps = {
  language: Language;
  isMicActive: boolean;
  isDafOutputOn: boolean;
  holdToDafEnabled: boolean;
  isHoldKeyPressed: boolean;
  formattedHoldKey: string;
};

export function StatusIndicator({
  language,
  isMicActive,
  isDafOutputOn,
  holdToDafEnabled,
  isHoldKeyPressed,
  formattedHoldKey,
}: StatusIndicatorProps) {
  const t = copy[language];
  const statusText = isDafOutputOn ? t.dafOn : t.dafOff;
  const triggerText = holdToDafEnabled
    ? isHoldKeyPressed
      ? t.triggerPressed
      : t.triggerReleased
    : t.alwaysOnMode;

  return (
    <div
      className={`rounded-xl border p-5 transition ${
        isDafOutputOn
          ? 'border-mint/70 bg-mint/14 shadow-[0_0_36px_rgba(143,235,202,0.16)]'
          : 'border-white/10 bg-[#111a1f]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`grid h-16 w-16 place-items-center rounded-xl ${
              isDafOutputOn ? 'bg-mint text-[#061412]' : 'bg-white/8 text-moss'
            }`}
          >
            <Activity size={30} aria-hidden />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-moss">{t.dafStatus}</div>
            <div className={`mt-1 text-4xl font-black ${isDafOutputOn ? 'text-mint' : 'text-ink'}`}>{statusText}</div>
          </div>
        </div>

        <div className="grid gap-2 text-right">
          <div className="inline-flex items-center justify-end gap-2 text-sm font-bold text-ink">
            <RadioTower size={16} aria-hidden />
            {isMicActive ? t.micActive : t.micInactive}
          </div>
          <div className="inline-flex items-center justify-end gap-2 text-sm font-bold text-moss">
            <Footprints size={16} aria-hidden />
            {triggerText}
          </div>
          <div className="font-mono text-lg font-black text-ink">{formattedHoldKey}</div>
        </div>
      </div>

      {!isMicActive ? <p className="mt-4 text-sm font-semibold text-moss">{t.micRequired}</p> : null}
    </div>
  );
}
