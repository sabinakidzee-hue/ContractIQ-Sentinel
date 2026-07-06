/**
 * ContractIQ Sentinel — SVG Logo Component
 * Variants: "full" (icon + wordmark), "icon" (icon only), "wordmark" (text only)
 */
export default function Logo({ variant = 'full', size = 36, light = true }) {
  const textColor = light ? '#ffffff' : '#161616';
  const accentBlue = '#0f62fe';
  const accentLight = '#4589ff';

  const iconMark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Shield body */}
      <path
        d="M20 3L5 9.5V20C5 28.5 11.8 36.4 20 38.5C28.2 36.4 35 28.5 35 20V9.5L20 3Z"
        fill={accentBlue}
      />
      {/* Shield inner highlight */}
      <path
        d="M20 7L8 12.5V20C8 27.2 13.3 33.8 20 35.7C26.7 33.8 32 27.2 32 20V12.5L20 7Z"
        fill={accentLight}
        opacity="0.25"
      />
      {/* Document lines — contract representation */}
      <rect x="14" y="14" width="12" height="1.8" rx="0.9" fill="#ffffff" />
      <rect x="14" y="18" width="9" height="1.8" rx="0.9" fill="#ffffff" opacity="0.85" />
      <rect x="14" y="22" width="10.5" height="1.8" rx="0.9" fill="#ffffff" opacity="0.7" />
      <rect x="14" y="26" width="7" height="1.8" rx="0.9" fill="#ffffff" opacity="0.55" />
      {/* Magnifier circle — AI lens */}
      <circle cx="28" cy="27" r="5.5" fill="#161616" opacity="0.65" />
      <circle cx="28" cy="27" r="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="31" y1="30.5" x2="33.5" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  if (variant === 'icon') return iconMark;

  if (variant === 'wordmark') {
    return (
      <svg
        width={110}
        height={size * 0.6}
        viewBox="0 0 110 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ContractIQ Sentinel"
      >
        <text x="0" y="16" fontFamily="'IBM Plex Sans', sans-serif" fontSize="13" fontWeight="700" fill={textColor}>ContractIQ</text>
        <text x="0" y="24" fontFamily="'IBM Plex Sans', sans-serif" fontSize="8" fontWeight="600" fill={accentBlue} letterSpacing="2">SENTINEL</text>
      </svg>
    );
  }

  // full
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {iconMark}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
            fontSize: size * 0.38,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.3px',
          }}
        >
          ContractIQ
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
            fontSize: size * 0.2,
            fontWeight: 600,
            color: accentBlue,
            letterSpacing: '0.18em',
            marginTop: 1,
          }}
        >
          SENTINEL
        </span>
      </div>
    </div>
  );
}
