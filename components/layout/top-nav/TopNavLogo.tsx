import Image from "next/image";
import Link from "next/link";

export function TopNavLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
    >
      <div className="h-12e w-14 overflow-hidden">
        <Image
          src="/logo_r.jpeg"
          alt="Reeltime logo"
          width={64}
          height={64}
          priority
          className="h-full w-full object-cover object-top"
        />
      </div>
    </Link>
  );
}
