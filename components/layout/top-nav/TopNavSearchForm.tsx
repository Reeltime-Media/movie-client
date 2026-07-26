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
        className="relative hidden w-[min(100%,14rem)] shrink min-w-0 md:block lg:w-[min(100%,16rem)] xl:w-[min(100%,20rem)] 2xl:w-[min(100%,24rem)]"
        role="search"
        onSubmit={onSubmit}
      >
        <label htmlFor={inputId} className="sr-only">
          {searchLabel}
        </label>
        <input
          id={inputId}
          name="q"
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder={placeholder}
          className="rt-search-input h-11 w-full rounded-full border-none bg-white py-2 pl-4 pr-11 text-[13px] text-black outline-none transition-shadow placeholder:text-neutral-500 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.35)]"
        />
        <button
          type="submit"
          aria-label={searchLabel}
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-neutral-800"
        >
          <Search size={15} aria-hidden />
        </button>
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
