import { createTheme } from '@mui/material/styles';

const ibmBlue = '#0f62fe';
const ibmBlueDark = '#0043ce';
const ibmBlueLight = '#4589ff';
const ibmGray10 = '#f4f4f4';
const ibmGray20 = '#e0e0e0';
const ibmGray80 = '#393939';
const ibmGray90 = '#262626';
const ibmGray100 = '#161616';
const ibmRed = '#da1e28';
const ibmGreen = '#198038';
const ibmYellow = '#f1c21b';
const ibmPurple = '#8a3ffc';

const baseTypography = {
  fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
  h1: { fontSize: '2.25rem', fontWeight: 300, letterSpacing: '-0.5px', lineHeight: 1.2 },
  h2: { fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.3px', lineHeight: 1.25 },
  h3: { fontSize: '1.375rem', fontWeight: 400, lineHeight: 1.3 },
  h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
  h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.01em' },
  body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
  body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.02em' },
  overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
  button: { fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ibmBlue, dark: ibmBlueDark, light: ibmBlueLight, contrastText: '#ffffff' },
    secondary: { main: ibmPurple, contrastText: '#ffffff' },
    error: { main: ibmRed },
    warning: { main: '#ff832b' },
    success: { main: ibmGreen },
    info: { main: '#0072c3' },
    background: { default: ibmGray10, paper: '#ffffff' },
    text: { primary: ibmGray100, secondary: '#525252', disabled: '#a8a8a8' },
    divider: ibmGray20,
    risk: {
      low: ibmGreen,
      medium: '#f1c21b',
      high: '#ff832b',
      critical: ibmRed,
    },
  },
  typography: baseTypography,
  shape: { borderRadius: 4 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 6px rgba(0,0,0,0.10)',
    '0 4px 12px rgba(0,0,0,0.10)',
    '0 6px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.12)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${ibmGray10}; }
        ::-webkit-scrollbar-thumb { background: ${ibmGray20}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #c6c6c6; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
        containedPrimary: {
          background: ibmBlue,
          '&:hover': { background: ibmBlueDark },
        },
        outlinedPrimary: {
          borderColor: ibmBlue,
          '&:hover': { borderColor: ibmBlueDark, background: 'rgba(15,98,254,0.06)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 0, border: `1px solid ${ibmGray20}`, boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 600, fontSize: '0.6875rem' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#525252', background: ibmGray10 },
        body: { fontSize: '0.875rem' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, height: 4 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ibmBlueLight, dark: ibmBlue, light: '#a6c8ff', contrastText: '#000000' },
    secondary: { main: '#be95ff', contrastText: '#000000' },
    error: { main: '#ff8389' },
    warning: { main: '#ffb784' },
    success: { main: '#42be65' },
    info: { main: '#33b1ff' },
    background: { default: ibmGray100, paper: ibmGray90 },
    text: { primary: '#f4f4f4', secondary: '#c6c6c6', disabled: '#6f6f6f' },
    divider: ibmGray80,
    risk: {
      low: '#42be65',
      medium: '#f1c21b',
      high: '#ffb784',
      critical: '#ff8389',
    },
  },
  typography: baseTypography,
  shape: { borderRadius: 4 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.3)',
    '0 2px 6px rgba(0,0,0,0.35)',
    '0 4px 12px rgba(0,0,0,0.35)',
    '0 6px 16px rgba(0,0,0,0.4)',
    '0 8px 24px rgba(0,0,0,0.4)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${ibmGray100}; }
        ::-webkit-scrollbar-thumb { background: ${ibmGray80}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #525252; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 0, border: `1px solid ${ibmGray80}`, boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 600, fontSize: '0.6875rem' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c6c6c6', background: ibmGray90 },
        body: { fontSize: '0.875rem' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, height: 4 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
