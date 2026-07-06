import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tooltip, IconButton, Divider, Typography, useTheme,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Logo from '../common/Logo';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: <HomeOutlinedIcon /> },
  { label: 'Upload Contract', path: '/upload', icon: <UploadFileOutlinedIcon /> },
  { label: 'Contract Analysis', path: '/analysis', icon: <AssessmentOutlinedIcon /> },
  { label: 'Reports', path: '/reports', icon: <DescriptionOutlinedIcon /> },
  { label: 'About', path: '/about', icon: <InfoOutlinedIcon /> },
];

function SidebarContent({ collapsed, onCollapseToggle, onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: isDark ? '#1a1a1a' : '#161616',
        color: '#f4f4f4',
        overflow: 'hidden',
      }}
    >
      {/* Logo / Brand */}
      <Box
        sx={{
          px: collapsed ? 1 : 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {collapsed ? (
          /* Collapsed: show icon-only logo */
          <Box
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Logo variant="icon" size={32} light />
          </Box>
        ) : (
          /* Expanded: full logo */
          <Box
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <Logo variant="full" size={34} light />
          </Box>
        )}
        {!isMobile && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              onClick={onCollapseToggle}
              size="small"
              sx={{ color: '#c6c6c6', '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              {collapsed ? <MenuOpenIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1, px: 0 }}>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <ListItem key={path} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? label : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleNav(path)}
                  sx={{
                    minHeight: 48,
                    px: collapsed ? 0 : 2.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: isActive ? '#0f62fe' : 'transparent',
                    borderLeft: isActive ? '3px solid #4589ff' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: isActive ? '#0353e9' : 'rgba(255,255,255,0.08)',
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 'auto' : 40,
                      color: isActive ? '#ffffff' : '#c6c6c6',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#ffffff' : '#c6c6c6',
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom IBM badge */}
      {!collapsed && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <Box sx={{ p: 2.5, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ color: '#8d8d8d', display: 'block', fontSize: '0.6875rem' }}>
              IBM SkillsBuild Project
            </Typography>
            <Typography variant="caption" sx={{ color: '#6f6f6f', display: 'block', fontSize: '0.6875rem', mt: 0.25 }}>
              Powered by watsonx Orchestrate
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default function Sidebar({
  width, collapsedWidth, mobileOpen, onMobileClose,
  collapsed, onCollapseToggle, isMobile,
}) {
  const effectiveWidth = collapsed ? collapsedWidth : width;

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width, boxSizing: 'border-box', border: 'none' },
        }}
      >
        <SidebarContent collapsed={false} onClose={onMobileClose} isMobile />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: effectiveWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: effectiveWidth,
          boxSizing: 'border-box',
          border: 'none',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <SidebarContent
        collapsed={collapsed}
        onCollapseToggle={onCollapseToggle}
        isMobile={false}
      />
    </Drawer>
  );
}
