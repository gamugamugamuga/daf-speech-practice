import { Headphones, Languages, MonitorSpeaker } from 'lucide-react';
import type { Language } from '../types';
import { copy } from '../i18n';

type HeaderProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function Header({ language, onLanguageChange }: HeaderProps) {
  const t = copy[language];

  return (
    <header className="flex items-center justify-between gap-8">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-ink text-white shadow-soft">
          <Headphones size={26} aria-hidden />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-normal text-ink">{t.appName}</h1>
          <p className="mt-1 text-sm font-medium text-moss">{t.tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md bg-white/75 px-3 py-2 text-xs font-semibold text-moss ring-1 ring-black/10 xl:flex">
          <MonitorSpeaker size={16} aria-hidden />
          {t.windowsReady}
        </div>
        <div className="flex items-center gap-1 rounded-md bg-white p-1 shadow-soft ring-1 ring-black/10">
          <Languages className="ml-2 text-moss" size={17} aria-hidden />
          {(['ja', 'en'] as const).map((item) => (
            <button
              key={item}
              className={`h-9 rounded-md px-3 text-sm font-bold transition ${
                language === item ? 'bg-ink text-white' : 'text-moss hover:bg-paper'
              }`}
              type="button"
              onClick={() => onLanguageChange(item)}
            >
              {item === 'ja' ? t.japanese : t.english}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
