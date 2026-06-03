import Image from "next/image";
import Link from "next/link";

export function TopNavLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
    >
      <div className="h-7 w-7 overflow-hidden rounded-md bg-brand">
        <Image
          src="/logo_r.jpeg"
          alt="Reeltime logo"
          width={28}
          height={28}
          priority
          className="h-full w-full object-cover object-top"
        />
      </div>
      <span className="hidden text-[14px] font-extrabold tracking-[0.06em] text-text sm:inline">
        REELTIME
      </span>
    </Link>
  );
}
