interface LogoProps {
  size?: number;
}

export default function ZentrixLogo({ size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="hsl(174, 72%, 46%)" />
      <line x1="9" y1="10" x2="23" y2="10" stroke="hsl(220, 20%, 6%)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="23" y1="10" x2="9" y2="22" stroke="hsl(220, 20%, 6%)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="9" y1="22" x2="23" y2="22" stroke="hsl(220, 20%, 6%)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="29" r="2" fill="hsl(40, 95%, 60%)" />
    </svg>
  );
}
