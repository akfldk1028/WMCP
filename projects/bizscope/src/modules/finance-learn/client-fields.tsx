'use client';

/**
 * Client-only interactive primitives. Kept in a sibling file so the rest of
 * `primitives.tsx` can stay a pure server module — chapter pages then render
 * server-side and only the simulator islands hydrate.
 */

export function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {hint ? <span className="text-[10px] text-muted-foreground/70">{hint}</span> : null}
      </span>
      <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:border-indigo-500">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const raw = Number(e.target.value);
            onChange(Number.isFinite(raw) ? raw : 0);
          }}
          className="w-full bg-transparent text-sm outline-none"
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}
