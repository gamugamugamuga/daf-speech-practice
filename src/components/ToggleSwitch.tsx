type ToggleSwitchProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ checked, label, onChange }: ToggleSwitchProps) {
  return (
    <button
      className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition ${
        checked ? 'border-mint/55 bg-mint/12' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-mint' : 'bg-white/18'}`}>
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  );
}
