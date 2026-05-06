import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Panel({ title, description, action, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-black/10 bg-white/82 p-5 shadow-soft backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {description ? <p className="mt-1 max-w-xl text-sm leading-6 text-moss">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
