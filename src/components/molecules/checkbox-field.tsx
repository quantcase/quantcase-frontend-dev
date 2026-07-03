"use client";

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}

export function CheckboxField({ checked, onChange, label, hint }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-3.5 accent-[#0F172B]"
      />
      <span>
        <span className="block text-[13px] text-[#0F172B] font-medium">{label}</span>
        {hint && <span className="block text-[11px] text-[#888888] mt-0.5 max-w-[320px]">{hint}</span>}
      </span>
    </label>
  );
}
