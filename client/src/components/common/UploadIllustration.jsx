/**
 * Professional upload illustration — SVG, no external assets
 */
export default function UploadIllustration({ width = 200, isDark = false }) {
  const bg = isDark ? '#262626' : '#f4f4f4';
  const surface = isDark ? '#393939' : '#ffffff';
  const border = isDark ? '#525252' : '#e0e0e0';
  const blue = '#0f62fe';
  const blueLight = '#4589ff';
  const textMuted = isDark ? '#8d8d8d' : '#a8a8a8';
  const textPrimary = isDark ? '#f4f4f4' : '#161616';

  return (
    <svg
      width={width}
      height={width * 0.85}
      viewBox="0 0 240 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Upload contract illustration"
    >
      {/* Background document stack (depth) */}
      <rect x="58" y="28" width="108" height="140" rx="4" fill={border} />
      <rect x="54" y="24" width="108" height="140" rx="4" fill={border} opacity="0.6" />

      {/* Main document card */}
      <rect x="50" y="20" width="140" height="148" rx="4" fill={surface} stroke={border} strokeWidth="1.5" />

      {/* Document header bar */}
      <rect x="50" y="20" width="140" height="28" rx="4" fill={blue} />
      <rect x="50" y="36" width="140" height="12" fill={blue} />

      {/* Document title area */}
      <rect x="66" y="27" width="60" height="7" rx="2" fill="rgba(255,255,255,0.9)" />
      <rect x="132" y="29" width="28" height="4" rx="2" fill="rgba(255,255,255,0.45)" />

      {/* Horizontal rule lines */}
      <rect x="64" y="60" width="112" height="5" rx="2.5" fill={border} />
      <rect x="64" y="72" width="90" height="4" rx="2" fill={border} />
      <rect x="64" y="84" width="100" height="4" rx="2" fill={border} />
      <rect x="64" y="96" width="72" height="4" rx="2" fill={border} />
      <rect x="64" y="112" width="112" height="4" rx="2" fill={border} />
      <rect x="64" y="122" width="80" height="4" rx="2" fill={border} />
      <rect x="64" y="132" width="95" height="4" rx="2" fill={border} />

      {/* Signature line */}
      <rect x="64" y="148" width="50" height="2" rx="1" fill={border} />
      <rect x="130" y="148" width="50" height="2" rx="1" fill={border} />

      {/* Upload arrow cloud — centred above document */}
      {/* Cloud body */}
      <ellipse cx="120" cy="175" rx="38" ry="14" fill={bg} />
      <circle cx="101" cy="170" r="11" fill={bg} />
      <circle cx="120" cy="166" r="15" fill={bg} />
      <circle cx="138" cy="170" r="11" fill={bg} />
      {/* Cloud fill */}
      <ellipse cx="120" cy="175" rx="37" ry="12" fill={blueLight} opacity="0.18" />
      <circle cx="101" cy="170" r="10" fill={blueLight} opacity="0.18" />
      <circle cx="120" cy="166" r="14" fill={blueLight} opacity="0.18" />
      <circle cx="138" cy="170" r="10" fill={blueLight} opacity="0.18" />
      {/* Cloud outline */}
      <path
        d="M88 180 Q82 180 82 172 A13 13 0 0 1 95 159 Q96 148 107 146 Q116 138 126 143 Q136 138 142 146 Q152 147 154 157 A12 12 0 0 1 158 172 Q158 180 151 180 Z"
        fill={surface}
        stroke={blue}
        strokeWidth="1.8"
      />
      {/* Upload arrow */}
      <line x1="120" y1="175" x2="120" y2="157" stroke={blue} strokeWidth="2.5" strokeLinecap="round" />
      <polyline points="113,163 120,155 127,163" fill="none" stroke={blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Floating badge: PDF */}
      <rect x="18" y="76" width="38" height="24" rx="4" fill={blue} />
      <text x="27" y="92" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fontWeight="700" fill="#ffffff">PDF</text>

      {/* Floating badge: DOCX */}
      <rect x="184" y="90" width="44" height="24" rx="4" fill={blueLight} />
      <text x="191" y="106" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fontWeight="700" fill="#ffffff">DOCX</text>

      {/* Sparkle dots — AI effect */}
      <circle cx="34" cy="50" r="3" fill={blueLight} opacity="0.7" />
      <circle cx="204" cy="58" r="2.5" fill={blue} opacity="0.6" />
      <circle cx="196" cy="140" r="2" fill={blueLight} opacity="0.5" />
      <circle cx="28" cy="140" r="2.5" fill={blue} opacity="0.5" />
    </svg>
  );
}
