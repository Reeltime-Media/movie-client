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
    "relative whitespace-nowrap rounded-md px-3 py-2.5 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    active
      ? [
          "text-text",
          "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand",
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
