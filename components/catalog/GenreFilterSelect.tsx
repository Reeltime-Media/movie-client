"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={["relative shrink-0", className].filter(Boolean).join(" ")}>
      <span id={id} className="sr-only">{label}</span>

      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 border border-border bg-surface px-3 py-2 text-[13px] font-semibold text-text outline-none transition-colors hover:border-border-hover hover:bg-surface-elevated focus-visible:border-border-hover focus-visible:bg-surface-elevated"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={15}
          className={["shrink-0 text-text-muted transition-transform duration-150", open ? "rotate-180" : ""].join(" ")}
          aria-hidden
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 border border-border bg-surface py-1 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={[
                  "cursor-pointer px-3 py-2 text-[13px] transition-colors",
                  isSelected
                    ? "bg-surface-elevated font-semibold text-brand"
                    : "font-medium text-text hover:bg-surface-elevated hover:text-text",
                ].join(" ")}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
