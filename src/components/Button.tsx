import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
};

const variants = {
  primary: 'bg-ink text-white hover:bg-[#26352f]',
  secondary: 'bg-white text-ink ring-1 ring-black/10 hover:bg-[#fbfaf6]',
  danger: 'bg-coral text-ink hover:bg-[#ff7d5a]',
  ghost: 'bg-transparent text-ink hover:bg-black/5',
};

export function Button({ variant = 'secondary', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
