import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, LinearProgress, Divider, useTheme,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { dummyRecentContracts, dummyStats } from '../data/dummyData';
import StatusChip from '../components/common/StatusChip';
import SectionHeader from '../components/common/SectionHeader';
import Logo from '../components/common/Logo';
import { HomeSkeleton } from '../components/common/DashboardSkeleton';

const KPI_CARDS = (stats, navigate) => [
  {
    label: 'Contracts Analysed',
    value: stats.totalAnalysed,
    sub: `+${stats.contractsThisMonth} this month`,
    icon: <AssessmentOutlinedIcon sx={{ fontSize: 32 }} />,
    color: '#0f62fe',
    onClick: () => navigate('/analysis'),
  },
  {
    label: 'High-Risk Contracts',
    value: stats.highRiskContracts,
    sub: 'Require immediate review',
    icon: <WarningAmberOutlinedIcon sx={{ fontSize: 32 }} />,
    color: '#da1e28',
    onClick: () => navigate('/analysis'),
  },
  {
    label: 'Deviations Detected',
    value: stats.deviationsDetected,
    sub: 'Across all contracts',
    icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
    color: '#b45309',
    onClick: () => navigate('/reports'),
  },
  {
    label: 'Avg. Risk Score',
    value: stats.avgRiskScore,
    sub: 'Platform-wide average',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />,
    color: '#198038',
    onClick: null,
  },
];

function RiskBar({ score }) {
  const color =
    score >= 75 ? '#da1e28' : score >= 50 ? '#b45309' : score >= 25 ? '#f1c21b' : '#198038';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1,
          height: 6,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 28 }}>
        {score}
      </Typography>
    </Box>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  // Simulate data load for skeleton demo
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <HomeSkeleton />;

  return (
    <Box>
      {/* Hero banner */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #161616 0%, #262626 100%)',
          color: '#ffffff',
          borderRadius: 0,
          p: { xs: 3, md: 5 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, right: 0, bottom: 0,
            width: '40%',
            background: 'linear-gradient(135deg, transparent, rgba(15,98,254,0.15))',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Logo in hero */}
        <Box sx={{ mb: 3 }}>
          <Logo variant="full" size={40} light />
        </Box>
        <Typography variant="overline" sx={{ color: '#4589ff', mb: 1, display: 'block' }}>
          IBM watsonx Orchestrate · Enterprise Platform
        </Typography>
        <Typography variant="h2" sx={{ color: '#fff', fontWeight: 300, mb: 1 }}>
          AI Contract Intelligence
        </Typography>
        <Typography variant="body1" sx={{ color: '#c6c6c6', maxWidth: 540, mb: 3, lineHeight: 1.7 }}>
          Upload vendor agreements, detect clause deviations, assess risks, and generate
          executive-ready reports — all powered by IBM Granite and watsonx Orchestrate.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => navigate('/upload')}
            sx={{
              bgcolor: '#0f62fe',
              '&:hover': { bgcolor: '#0353e9' },
              fontWeight: 700,
              px: 3,
            }}
          >
            Upload Contract
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<AssessmentOutlinedIcon />}
            onClick={() => navigate('/analysis')}
            sx={{
              borderColor: '#c6c6c6',
              color: '#c6c6c6',
              '&:hover': { borderColor: '#ffffff', color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            View Analysis
          </Button>
        </Box>
      </Box>

      {/* KPI Cards — with hover lift animation */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {KPI_CARDS(dummyStats, navigate).map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.label}>
            <Card
              onClick={kpi.onClick}
              sx={{
                cursor: kpi.onClick ? 'pointer' : 'default',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                borderTop: `3px solid ${kpi.color}`,
                '&:hover': kpi.onClick ? {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px rgba(0,0,0,0.14)`,
                } : {},
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {kpi.label}
                    </Typography>
                    <Typography variant="h2" fontWeight={300} sx={{ my: 0.5, color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.sub}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: kpi.color,
                      opacity: 0.18,
                      mt: 0.5,
                      transition: 'opacity 0.18s ease',
                      '.MuiCard-root:hover &': { opacity: 0.55 },
                    }}
                  >
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent contracts table + Workflow guide */}
      <Grid container spacing={3}>
        {/* Recent contracts */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, pb: 0 }}>
                <SectionHeader
                  title="Recent Contracts"
                  subtitle="Last 5 contracts analysed on the platform"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/analysis')}
                    >
                      View All
                    </Button>
                  }
                />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Contract</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Risk Score</TableCell>
                      <TableCell>Deviations</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dummyRecentContracts.map((c) => (
                      <TableRow
                        key={c.id}
                        hover
                        onClick={() => navigate('/analysis')}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                            {c.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.uploadedAt}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {c.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <RiskBar score={c.riskScore} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.deviations}
                            size="small"
                            sx={{ fontWeight: 700, minWidth: 32 }}
                            color={c.deviations >= 6 ? 'error' : c.deviations >= 3 ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={c.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Workflow guide */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="How It Works" subtitle="Automated contract review pipeline" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { step: '01', label: 'Upload Contract', desc: 'Upload a PDF or DOCX vendor agreement.', color: '#0f62fe' },
                  { step: '02', label: 'Text Extraction', desc: 'AI extracts all contract text and clauses.', color: '#0072c3' },
                  { step: '03', label: 'watsonx Analysis', desc: 'IBM Granite compares against enterprise template.', color: '#8a3ffc' },
                  { step: '04', label: 'Risk Assessment', desc: 'Deviations scored and ranked by severity.', color: '#b45309' },
                  { step: '05', label: 'Export Report', desc: 'Download an executive-ready Excel report.', color: '#198038' },
                ].map((item, idx, arr) => (
                  <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: '50%',
                          bgcolor: item.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </Box>
                      {idx < arr.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5, minHeight: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ pb: idx < arr.length - 1 ? 2 : 0 }}>
                      <Typography variant="body2" fontWeight={700}>{item.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => navigate('/upload')}
                sx={{ fontWeight: 700 }}
              >
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
