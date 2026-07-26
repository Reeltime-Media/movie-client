import type { Locale } from "@/lib/i18n";

type TopNavLocaleSwitcherProps = {
  locale: Locale;
  langSwitchLabel: string;
  englishLabel: string;
  khmerLabel: string;
  onSelect: (locale: Locale) => void;
  variant: "desktop" | "mobile";
};

export function TopNavLocaleSwitcher({
  locale,
  langSwitchLabel,
  englishLabel,
  khmerLabel,
  onSelect,
  variant,
}: TopNavLocaleSwitcherProps) {
  const buttonClass = (active: boolean) =>
    [
      "cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-colors",
      active ? "bg-white/25 text-white" : "text-white/65 hover:text-white",
    ].join(" ");

  const mobileButtonClass = (active: boolean) =>
    [
      "cursor-pointer rounded px-2.5 py-1 text-[11px] font-bold",
      active ? "bg-surface-elevated text-text" : "text-text-muted",
    ].join(" ");

  if (variant === "desktop") {
    return (
      <div
        className="hidden h-10 items-center rounded-lg border border-white/20 bg-white/10 p-1 sm:flex"
        role="group"
        aria-label={langSwitchLabel}
      >
        <button
          type="button"
          onClick={() => onSelect("en")}
          aria-pressed={locale === "en"}
          className={buttonClass(locale === "en")}
        >
          {englishLabel}
        </button>
        <button
          type="button"
          onClick={() => onSelect("km")}
          aria-pressed={locale === "km"}
          className={buttonClass(locale === "km")}
        >
          {khmerLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
      <span className="text-[12px] font-semibold text-text-muted">{langSwitchLabel}</span>
      <div className="flex items-center rounded-md border border-border bg-bg p-0.5">
        <button
          type="button"
          onClick={() => onSelect("en")}
          aria-pressed={locale === "en"}
          className={mobileButtonClass(locale === "en")}
        >
          {englishLabel}
        </button>
        <button
          type="button"
          onClick={() => onSelect("km")}
          aria-pressed={locale === "km"}
          className={mobileButtonClass(locale === "km")}
        >
          {khmerLabel}
        </button>
      </div>
    </div>
  );
}
