export function iconButtonClassName(extra = "") {
  return [
    "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white/85 transition-colors",
    "hover:border-white/40 hover:bg-white/20 hover:text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function navLinkClassName(active: boolean) {
  return [
    "relative whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium leading-normal tracking-[-0.01em] transition-colors duration-200 xl:px-3",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
    active
      ? [
          "text-white",
          "after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-white xl:inset-x-3",
        ].join(" ")
      : "text-white/70 hover:text-white",
  ].join(" ");
}

export function mobileNavLinkClassName(active: boolean) {
  return [
    "flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold transition-colors",
    active ? "bg-brand text-white" : "text-text-muted hover:bg-surface hover:text-text",
  ].join(" ");
}
