export function iconButtonClassName(extra = "") {
  return [
    "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/60 bg-surface/50 text-text-muted transition-colors",
    "hover:border-border-hover hover:bg-surface hover:text-text",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function navLinkClassName(active: boolean) {
  return [
    "relative whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium leading-normal tracking-[-0.01em] transition-colors duration-200 xl:px-3",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    active
      ? [
          "text-text",
          "after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand xl:inset-x-3",
        ].join(" ")
      : "text-text-muted hover:text-text",
  ].join(" ");
}

export function mobileNavLinkClassName(active: boolean) {
  return [
    "flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold transition-colors",
    active ? "bg-brand text-white" : "text-text-muted hover:bg-surface hover:text-text",
  ].join(" ");
}
