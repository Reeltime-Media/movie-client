/** Recognizable payment-method marks for the checkout summary. Decorative only. */

function BadgeShell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      aria-label={label}
      title={label}
      className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-surface-elevated px-2"
    >
      {children}
    </span>
  );
}

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      role="img"
      aria-label="Accepted payment methods: KHQR, ABA Pay"
    >
      <BadgeShell label="KHQR">
        <span className="text-[10px] font-extrabold tracking-tight text-[#E2231A]">KHQR</span>
      </BadgeShell>

      <BadgeShell label="ABA Pay">
        <span className="text-[10px] font-extrabold tracking-tight text-[#0A4DA1]">ABA</span>
      </BadgeShell>
    </div>
  );
}
