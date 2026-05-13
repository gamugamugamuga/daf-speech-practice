import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
};

const variants = {
  primary: 'bg-mint text-[#061412] hover:bg-[#a5f4d7]',
  secondary: 'bg-white/8 text-ink ring-1 ring-white/12 hover:bg-white/12',
  danger: 'bg-coral text-[#1d0b06] hover:bg-[#ffa48c]',
  ghost: 'bg-transparent text-ink hover:bg-white/8',
};

export function Button({ variant = 'secondary', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
