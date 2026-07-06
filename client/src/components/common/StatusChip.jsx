import { Chip } from '@mui/material';

const CONFIG = {
  critical: { label: 'Critical', sx: { bgcolor: '#fff1f1', color: '#da1e28', border: '1px solid #ffb3b8' } },
  high:     { label: 'High Risk', sx: { bgcolor: '#fff3e0', color: '#b45309', border: '1px solid #fed7aa' } },
  medium:   { label: 'Medium Risk', sx: { bgcolor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' } },
  low:      { label: 'Low Risk', sx: { bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' } },
  analysed: { label: 'Analysed', sx: { bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' } },
  flagged:  { label: 'Flagged', sx: { bgcolor: '#fff1f1', color: '#da1e28', border: '1px solid #ffb3b8' } },
  pending:  { label: 'Pending', sx: { bgcolor: '#f4f4f4', color: '#525252', border: '1px solid #e0e0e0' } },
  urgent:       { label: 'Urgent', sx: { bgcolor: '#fff1f1', color: '#da1e28', border: '1px solid #ffb3b8' } },
  required:     { label: 'Required', sx: { bgcolor: '#fff3e0', color: '#b45309', border: '1px solid #fed7aa' } },
  recommended:  { label: 'Recommended', sx: { bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' } },
};

export default function StatusChip({ status, size = 'small' }) {
  const cfg = CONFIG[status?.toLowerCase()] ?? CONFIG.pending;
  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{ fontWeight: 700, fontSize: '0.6875rem', borderRadius: 1, ...cfg.sx }}
    />
  );
}
