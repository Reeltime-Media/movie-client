type HeroBackgroundProps = {
  idPrefix?: string;
};

export function HeroBackground({ idPrefix = "rt-hero" }: HeroBackgroundProps) {
  const spotId = `${idPrefix}-spot`;
  const hazeId = `${idPrefix}-haze`;
  const grainId = `${idPrefix}-grain`;

  return (
    <>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 340"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={spotId} cx="68%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#7A1A20" stopOpacity="1" />
            <stop offset="30%" stopColor="#3D0C12" stopOpacity="1" />
            <stop offset="70%" stopColor="#0A0A0A" stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </radialGradient>

          <radialGradient id={hazeId} cx="68%" cy="38%" r="40%">
            <stop offset="0%" stopColor="#E50914" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#E50914" stopOpacity="0" />
          </radialGradient>

          <filter id={grainId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0" />
          </filter>
        </defs>

        <rect width="1440" height="340" fill={`url(#${spotId})`} />
        <rect width="1440" height="340" fill={`url(#${hazeId})`} />

        <g opacity="0.06" transform="translate(980, 120)">
          <circle cx="0" cy="0" r="120" fill="none" stroke="#FAFAFA" strokeWidth="1" />
          <circle cx="0" cy="0" r="80" fill="none" stroke="#FAFAFA" strokeWidth="1" />
          <circle cx="0" cy="0" r="40" fill="none" stroke="#FAFAFA" strokeWidth="1" />
        </g>

        <rect width="1440" height="340" filter={`url(#${grainId})`} />
      </svg>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </>
  );
}
