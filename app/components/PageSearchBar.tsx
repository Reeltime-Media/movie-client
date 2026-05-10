"use client";

import { Search, X } from "lucide-react";
import { useId, useState } from "react";

export function PageSearchBar({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");

  return (
    <div
      className="group relative flex w-full max-w-2xl items-center rounded-[6px] border border-border bg-surface transition-colors focus-within:border-border-hover focus-within:bg-surface-elevated"
      role="search"
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={[
          "min-h-[44px] w-full rounded-[6px] bg-transparent py-2 pl-10 text-[13px] leading-normal text-text outline-none placeholder:text-text-disabled",
          query.length > 0 ? "pr-10" : "pr-3",
        ].join(" ")}
      />
      {query.length > 0 ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[4px] text-text-muted transition-colors hover:bg-border hover:text-text"
          aria-label="Clear search"
        >
          <X size={15} strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
