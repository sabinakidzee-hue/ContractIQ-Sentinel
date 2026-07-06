import { useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

function getRiskColor(score, isDark) {
  if (score >= 75) return isDark ? '#ff8389' : '#da1e28';
  if (score >= 50) return isDark ? '#ffb784' : '#b45309';
  if (score >= 25) return isDark ? '#f1c21b' : '#b45309';
  return isDark ? '#42be65' : '#198038';
}

function getRiskLabel(score) {
  if (score >= 75) return 'Critical Risk';
  if (score >= 50) return 'High Risk';
  if (score >= 25) return 'Medium Risk';
  return 'Low Risk';
}

export default function RiskScoreGauge({ score = 0, compact = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = getRiskColor(score, isDark);
  const label = getRiskLabel(score);
  const circleRef = useRef(null);

  const radius = compact ? 44 : 62;
  const strokeWidth = compact ? 7 : 10;
  const circumference = 2 * Math.PI * radius;
  // 270° sweep arc starting from bottom-left, going clockwise
  const arcRatio = 0.75;
  const arcLength = circumference * arcRatio;
  // target offset for this score
  const targetOffset = arcLength - (score / 100) * arcLength;

  const svgSize = (radius + strokeWidth + 6) * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  // Animate the stroke-dashoffset from arcLength → targetOffset on mount
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    // Start fully empty
    el.style.transition = 'none';
    el.setAttribute('stroke-dashoffset', String(arcLength));
    // Force reflow so the starting state is painted
    void el.getBoundingClientRect();
    // Animate to target
    el.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.setAttribute('stroke-dashoffset', String(targetOffset));
  }, [score, arcLength, targetOffset]);

  const trackColor = isDark ? '#393939' : '#e0e0e0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* SVG arc gauge */}
        <svg
          width={svgSize}
          height={svgSize * 0.64}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ overflow: 'visible', transform: 'rotate(-225deg)', display: 'block' }}
        >
          {/* Track circle */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated progress arc */}
          <circle
            ref={circleRef}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={arcLength}
            strokeLinecap="round"
          />
        </svg>

        {/* Numeric score — centred in the arc */}
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontSize: compact ? '1.5rem' : '2rem',
              fontWeight: 700,
              lineHeight: 1,
              color,
              fontFamily: '"IBM Plex Mono", monospace',
            }}
          >
            {score}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: compact ? '0.6rem' : '0.7rem', letterSpacing: '0.04em' }}
          >
            / 100
          </Typography>
        </Box>
      </Box>

      {/* Risk level label */}
      <Typography
        variant={compact ? 'caption' : 'body2'}
        fontWeight={700}
        sx={{ color, letterSpacing: '0.04em', mt: compact ? 0 : 0.5 }}
      >
        {label}
      </Typography>
    </Box>
  );
}
