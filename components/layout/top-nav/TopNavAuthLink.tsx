import Link from "next/link";

type TopNavAuthLinkProps = {
  href: string;
  label: string;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function TopNavAuthLink({ href, label, variant, onNavigate }: TopNavAuthLinkProps) {
  if (variant === "desktop") {
    return (
      <Link
        href={href}
        className="hidden h-10 items-center rounded-lg bg-brand px-4 text-[13px] font-bold leading-none text-white shadow-[0_6px_18px_-8px_rgba(229,9,20,0.65)] transition-colors hover:bg-brand-hover md:inline-flex"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-[14px] font-bold text-white hover:bg-brand-hover"
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}
