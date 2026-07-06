import { Alert, AlertTitle, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ErrorBanner({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) {
  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ fontWeight: 600 }}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
}
