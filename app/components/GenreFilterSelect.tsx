"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

export function GenreFilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  const id = useId();

  return (
    <div className={["relative shrink-0", className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface py-2 pl-3 pr-9 text-[13px] font-semibold text-text outline-none transition-colors hover:border-border-hover focus:border-border-hover focus:bg-surface-elevated"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        aria-hidden
      />
    </div>
  );
}
