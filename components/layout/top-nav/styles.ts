export function iconButtonClassName(extra = "") {
  return [
    "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-text-muted transition-colors",
    "hover:bg-surface hover:text-text",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function navLinkClassName(active: boolean) {
  return [
    "relative rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    active
      ? "bg-brand text-white"
      : "text-text-muted hover:bg-surface hover:text-text",
  ].join(" ");
}

export function mobileNavLinkClassName(active: boolean) {
  return [
    "flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold transition-colors",
    active ? "bg-brand text-white" : "text-text-muted hover:bg-surface hover:text-text",
  ].join(" ");
}
