import {
  AppBar, Toolbar, Typography, IconButton, Tooltip, Box,
  Chip, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useThemeToggle } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/upload': 'Upload Contract',
  '/analysis': 'Contract Analysis',
  '/reports': 'Reports & Export',
  '/about': 'About',
};

export default function TopBar({ onMenuToggle, isMobile }) {
  const { toggleTheme, mode } = useThemeToggle();
  const theme = useTheme();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'ContractIQ Sentinel';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuToggle} size="small" sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Page title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {pageTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            AI-Powered Enterprise Contract Intelligence Platform
          </Typography>
        </Box>

        {/* IBM watsonx badge */}
        <Chip
          label="IBM watsonx"
          size="small"
          sx={{
            bgcolor: '#0f62fe',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.04em',
            display: { xs: 'none', sm: 'flex' },
            height: 24,
          }}
        />

        {/* Theme toggle */}
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={toggleTheme} size="small">
            {mode === 'light' ? (
              <DarkModeOutlinedIcon fontSize="small" />
            ) : (
              <LightModeOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
