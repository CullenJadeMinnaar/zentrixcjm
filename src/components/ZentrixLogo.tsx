interface LogoProps {
  size?: number;
}

export default function ZentrixLogo({ size = 32 }: LogoProps) {
  const id = `logo-grad-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(174, 72%, 52%)" />
          <stop offset="1" stopColor="hsl(174, 72%, 38%)" />
        </linearGradient>
      </defs>
      {/* Hexagon shell */}
      <path
        d="M16 2 L28.5 9.5 L28.5 22.5 L16 30 L3.5 22.5 L3.5 9.5 Z"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.8"
      />
      {/* Z letterform */}
      <path
        d="M10 11 H22 L10 21 H22"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Accent dot */}
      <circle cx="16" cy="27.5" r="1.5" fill="hsl(40, 95%, 60%)" />
    </svg>
  );
}
