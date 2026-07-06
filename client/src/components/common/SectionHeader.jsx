import { Box, Typography, Chip, useTheme } from '@mui/material';

export default function SectionHeader({ title, subtitle, badge, action, sx = {} }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        mb: 2.5,
        pb: 1.5,
        borderBottom: `2px solid #0f62fe`,
        ...sx,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{ bgcolor: '#0f62fe', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 20, borderRadius: 1 }}
            />
          )}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
