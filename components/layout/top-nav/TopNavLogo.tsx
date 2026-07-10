import Image from "next/image";
import Link from "next/link";

export function TopNavLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
    >
      <div className="h-8 w-8 overflow-hidden rounded-md bg-brand shadow-[0_4px_12px_-4px_rgba(229,9,20,0.55)]">
        <Image
          src="/logo_r.jpeg"
          alt="Reeltime logo"
          width={32}
          height={32}
          priority
          className="h-full w-full object-cover object-top"
        />
      </div>
      <span className="hidden text-[15px] font-extrabold tracking-[0.08em] text-text sm:inline">
        REELTIME
      </span>
    </Link>
  );
}
