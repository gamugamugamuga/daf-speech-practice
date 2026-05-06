import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

export function SelectField({ label, children, className = '', ...props }: SelectFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <select
        className={`h-11 rounded-md border border-black/10 bg-paper/75 px-3 text-sm font-semibold text-ink outline-none transition focus:border-[#2f795d] focus:bg-white focus:ring-4 focus:ring-mint/45 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
