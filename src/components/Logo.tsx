/**
 * Brand mark for विंध्यलीडर.
 * Visual meaning: layered peaks = the Vindhya range (regional identity),
 * a sun cresting the tallest peak = "Leader" — first light / breaking news,
 * radiating rays (top-right) = आवाज़ (voice) broadcasting outward.
 */
export function LogoMark({
  className = "h-11 w-11",
  instanceId = "default",
}: {
  className?: string;
  /** Distinguishes gradient IDs when multiple LogoMarks render on one page (header, footer, drawer) — plain prop, not a hook, so it also works inside the ImageResponse/Satori renderer used by icon.tsx. */
  instanceId?: string;
}) {
  const bgId = `vl-bg-${instanceId}`;
  const sunId = `vl-sun-${instanceId}`;

  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="विंध्यलीडर">
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id={sunId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${bgId})`} />
      <g stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <line x1="34" y1="13" x2="38.5" y2="8.5" />
        <line x1="37" y1="16.5" x2="42.5" y2="13" />
        <line x1="38" y1="20.5" x2="43.5" y2="18.5" />
      </g>
      <circle cx="24" cy="18" r="7" fill={`url(#${sunId})`} />
      <polygon points="3,36 11,24 17,30 24,17 31,28 39,22 45,36" fill="#ffffff" opacity="0.55" />
      <polygon points="3,39 10,28 18,33 26,25 34,32 41,27 45,39" fill="#ffffff" />
    </svg>
  );
}

export default LogoMark;
