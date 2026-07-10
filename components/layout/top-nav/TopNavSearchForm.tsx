import { Search } from "lucide-react";

type TopNavSearchFormProps = {
  searchLabel: string;
  placeholder: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  variant: "desktop" | "mobile";
};

export function TopNavSearchForm({
  searchLabel,
  placeholder,
  onSubmit,
  variant,
}: TopNavSearchFormProps) {
  const inputId = variant === "desktop" ? "topnav-search" : "topnav-search-mobile";

  if (variant === "desktop") {
    return (
      <form
        className="relative hidden w-[min(100%,14rem)] shrink-0 lg:block xl:w-[min(100%,18rem)] 2xl:w-[min(100%,22rem)]"
        role="search"
        onSubmit={onSubmit}
      >
        <label htmlFor={inputId} className="sr-only">
          {searchLabel}
        </label>
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          id={inputId}
          name="q"
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder={placeholder}
          className="rt-search-input h-10 w-full rounded-lg border border-border/80 bg-surface/70 py-2 pl-9 pr-3 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface focus:shadow-[0_0_0_3px_rgba(229,9,20,0.08)]"
        />
      </form>
    );
  }

  return (
    <form role="search" onSubmit={onSubmit} className="relative md:hidden">
      <label htmlFor={inputId} className="sr-only">
        {searchLabel}
      </label>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        aria-hidden
      />
      <input
        id={inputId}
        name="q"
        type="text"
        inputMode="search"
        enterKeyHint="search"
        placeholder={placeholder}
        className="rt-search-input h-11 w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-[14px] text-text outline-none placeholder:text-text-disabled focus:border-border-hover"
      />
    </form>
  );
}
