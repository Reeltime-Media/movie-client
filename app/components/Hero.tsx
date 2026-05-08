import { Info, PlayCircle, Star } from "lucide-react";

function HeroBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 340"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rt-hero-radial" cx="38%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#B81D24" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#5B0E14" stopOpacity="0.65" />
          <stop offset="70%" stopColor="#0A0A0A" stopOpacity="1" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="rt-hero-streak" x1="0" x2="1">
          <stop offset="0%" stopColor="#E50914" stopOpacity="0.0" />
          <stop offset="45%" stopColor="#E50914" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E50914" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <rect width="1440" height="340" fill="url(#rt-hero-radial)" />

      <g opacity="0.35">
        <path
          d="M-50 250 C 200 140, 360 220, 620 120 C 820 40, 980 70, 1490 -20"
          fill="none"
          stroke="url(#rt-hero-streak)"
          strokeWidth="34"
        />
        <path
          d="M-80 320 C 260 260, 460 290, 720 210 C 960 140, 1120 150, 1520 70"
          fill="none"
          stroke="url(#rt-hero-streak)"
          strokeWidth="18"
          opacity="0.7"
        />
      </g>

      <g opacity="0.18">
        <circle cx="1080" cy="110" r="78" fill="#FAFAFA" />
        <circle cx="1240" cy="170" r="34" fill="#FAFAFA" />
        <rect x="880" y="52" width="220" height="10" fill="#FAFAFA" />
        <rect x="910" y="74" width="160" height="8" fill="#FAFAFA" />
      </g>
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative h-[340px] w-full overflow-hidden">
      <HeroBackground />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/75 to-transparent to-[80%]" />

      <div className="absolute inset-0">
        <div className="h-full w-full px-8 py-[50px]">
          <div className="max-w-[460px]">
            <div className="inline-flex items-center rounded-[3px] bg-brand px-[9px] py-1 text-[10px] font-bold tracking-[0.12em] text-white">
              FEATURED
            </div>

            <h1 className="mt-3 text-[44px] font-extrabold leading-[1.02] tracking-[-0.025em] text-text">
              The Last Drive
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-[10px] text-[12px] font-medium text-text-muted">
              <span>2026</span>
              <span className="h-[3px] w-[3px] rounded-full bg-border-hover" />
              <span>2h 14m</span>
              <span className="h-[3px] w-[3px] rounded-full bg-border-hover" />
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="text-warning" />
                <span>8.7</span>
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-border-hover" />
              <span>Action</span>
              <span className="h-[3px] w-[3px] rounded-full bg-border-hover" />
              <span>Thriller</span>
            </div>

            <p className="mt-4 max-w-[420px] text-[13px] leading-relaxed text-[#E5E5E5]">
              A rideshare driver picks up the wrong passenger on a quiet Tuesday.
              By dawn, half the city is hunting them, and the truth is more
              dangerous than either of them.
            </p>

            <div className="mt-6 flex items-center gap-[10px]">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[6px] bg-brand px-[22px] py-[10px] text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                <PlayCircle size={15} />
                Watch now
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[6px] border border-white/20 bg-white/10 px-[22px] py-[10px] text-[13px] font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <Info size={15} />
                More info
              </button>
            </div>
          </div>

          <div className="absolute bottom-5 left-8 flex items-center gap-[6px]">
            <div className="h-[3px] w-[22px] rounded-[2px] bg-brand" />
            <div className="h-[3px] w-[22px] rounded-[2px] bg-border" />
            <div className="h-[3px] w-[22px] rounded-[2px] bg-border" />
            <div className="h-[3px] w-[22px] rounded-[2px] bg-border" />
          </div>
        </div>
      </div>
    </section>
  );
}

