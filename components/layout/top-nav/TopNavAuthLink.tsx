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
        className="hidden rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 md:inline-flex"
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
