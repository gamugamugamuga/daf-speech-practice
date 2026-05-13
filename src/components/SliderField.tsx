type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
};

export function SliderField({ label, value, min, max, step = 1, suffix = '', onChange }: SliderFieldProps) {
  return (
    <label className="grid gap-3">
      <span className="flex items-center justify-between text-sm font-semibold text-ink">
        <span>{label}</span>
        <span className="rounded-md bg-white/8 px-2 py-1 tabular-nums text-mint">
          {value}
          {suffix}
        </span>
      </span>
      <input
        className="h-3 w-full cursor-pointer"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="flex justify-between text-xs font-medium text-moss">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </span>
    </label>
  );
}
