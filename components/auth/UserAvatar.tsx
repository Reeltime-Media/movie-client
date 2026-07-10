import { CdnImage } from "@/components/ui/CdnImage";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-6.5 w-6.5 text-[11px]",
  md: "h-9 w-9 text-[12px]",
  lg: "h-16 w-16 text-[20px] sm:h-20 sm:w-20 sm:text-[22px]",
};

function initials(name?: string | null, email?: string | null): string {
  const source = (name?.trim() || email?.split("@")[0] || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function hueFromId(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h + seed.charCodeAt(i) * 17) % 360;
  }
  return h;
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const label = initials(name, email);
  const seed = email ?? name ?? "user";
  const sizeClass = sizeClasses[size];
  const imagePx = size === "lg" ? 80 : size === "md" ? 36 : 26;

  const shell = [
    "relative shrink-0 overflow-hidden rounded-full ring-1 ring-border",
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (avatarUrl) {
    return (
      <div className={shell}>
        <CdnImage
          src={avatarUrl}
          alt=""
          width={imagePx}
          height={imagePx}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${shell} grid place-items-center font-bold text-white`}
      style={{ backgroundColor: `hsl(${hueFromId(seed)} 42% 42%)` }}
      aria-hidden
    >
      {label}
    </div>
  );
}
