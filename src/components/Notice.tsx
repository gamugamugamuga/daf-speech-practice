import { ShieldAlert } from 'lucide-react';
import type { Language } from '../types';
import { copy } from '../i18n';

type NoticeProps = {
  language: Language;
};

export function Notice({ language }: NoticeProps) {
  const t = copy[language];

  return (
    <aside className="rounded-lg border border-[#d9b25c]/55 bg-[#fff5db] p-4 text-[#5b4718]">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 shrink-0" size={20} aria-hidden />
        <div>
          <h2 className="text-sm font-black">{t.noticeTitle}</h2>
          <p className="mt-1 text-sm font-medium leading-6">{t.notice}</p>
        </div>
      </div>
    </aside>
  );
}
