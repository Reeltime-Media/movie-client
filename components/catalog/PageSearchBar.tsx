"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";

export function PageSearchBar({
  label,
  placeholder,
  value,
  onValueChange,
  onSubmit,
  clearLabel,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  clearLabel?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <form
      className={[
        "group relative flex w-full max-w-2xl items-center rounded-md border border-border bg-surface transition-colors focus-within:border-border-hover focus-within:bg-surface-elevated",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text"
        aria-hidden
      />
      <input
        id={id}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={[
          "rt-search-input min-h-11 w-full rounded-md bg-transparent py-2 pl-10 text-[13px] leading-normal text-text outline-none placeholder:text-text-disabled",
          value.length > 0 ? "pr-10" : "pr-3",
        ].join(" ")}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-text-muted transition-colors hover:bg-border hover:text-text"
          aria-label={clearLabel ?? "Clear search"}
        >
          <X size={15} strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </form>
  );
}
