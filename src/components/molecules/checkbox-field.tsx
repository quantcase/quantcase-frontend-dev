"use client";

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export function CheckboxField({ checked, onChange, label, hint, disabled }: CheckboxFieldProps) {
  return (
    <label className={`flex items-start gap-2 select-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-3.5 accent-[var(--qc-ink)] disabled:cursor-not-allowed"
      />
      <span>
        <span className="block text-[13px] text-ink font-medium">{label}</span>
        {hint && <span className="block text-[11px] text-ink-3 mt-0.5 max-w-[320px]">{hint}</span>}
      </span>
    </label>
  );
}
