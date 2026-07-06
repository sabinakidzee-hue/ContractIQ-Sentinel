import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingOverlay({ message = 'Analysing contract with IBM watsonx…' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        gap: 3,
      }}
    >
      <CircularProgress size={52} thickness={3} sx={{ color: '#0f62fe' }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          {message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          IBM Granite is reviewing clauses against the enterprise template…
        </Typography>
      </Box>
    </Box>
  );
}
