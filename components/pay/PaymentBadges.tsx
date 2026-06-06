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
      aria-label="Accepted payment methods: Visa, Mastercard, KHQR, ABA Pay"
    >
      <BadgeShell label="Visa">
        <svg viewBox="0 0 48 16" className="h-3 w-auto" aria-hidden>
          <text
            x="0"
            y="13"
            fontFamily="Arial, sans-serif"
            fontSize="15"
            fontWeight="700"
            fontStyle="italic"
            fill="#1A1F71"
            letterSpacing="0.5"
          >
            VISA
          </text>
        </svg>
      </BadgeShell>

      <BadgeShell label="Mastercard">
        <svg viewBox="0 0 36 22" className="h-3.5 w-auto" aria-hidden>
          <circle cx="14" cy="11" r="9" fill="#EB001B" />
          <circle cx="22" cy="11" r="9" fill="#F79E1B" />
          <path
            d="M18 4.2a9 9 0 0 1 0 13.6 9 9 0 0 1 0-13.6Z"
            fill="#FF5F00"
          />
        </svg>
      </BadgeShell>

      <BadgeShell label="KHQR">
        <span className="text-[10px] font-extrabold tracking-tight text-[#E2231A]">KHQR</span>
      </BadgeShell>

      <BadgeShell label="ABA Pay">
        <span className="text-[10px] font-extrabold tracking-tight text-[#0A4DA1]">ABA</span>
      </BadgeShell>
    </div>
  );
}
