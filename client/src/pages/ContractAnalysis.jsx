import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Collapse, IconButton, Chip, Divider, Alert,
  Tabs, Tab, LinearProgress, List, ListItem, ListItemText,
  ListItemIcon, useTheme, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SectionHeader from '../components/common/SectionHeader';
import StatusChip from '../components/common/StatusChip';
import RiskScoreGauge from '../components/common/RiskScoreGauge';
import {
  dummyContract, dummyExecutiveSummary, dummyRiskAssessment,
  dummyDeviations, dummyRecommendations,
} from '../data/dummyData';
import { AnalysisSectionSkeleton } from '../components/common/DashboardSkeleton';

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY = {
  critical: { label: 'Critical',    color: '#da1e28', bg: '#fff1f1', border: '#ffb3b8', icon: <ErrorOutlineIcon fontSize="small" /> },
  high:     { label: 'High',        color: '#b45309', bg: '#fff7ed', border: '#fcd34d', icon: <WarningAmberOutlinedIcon fontSize="small" /> },
  medium:   { label: 'Medium',      color: '#854d0e', bg: '#fef9c3', border: '#fde68a', icon: <InfoOutlinedIcon fontSize="small" /> },
  low:      { label: 'Low',         color: '#15803d', bg: '#f0fdf4', border: '#86efac', icon: <CheckCircleOutlineIcon fontSize="small" /> },
};

function SeverityBadge({ level }) {
  const s = SEVERITY[level] ?? SEVERITY.low;
  return (
    <Chip
      icon={<Box sx={{ color: `${s.color} !important`, display: 'flex' }}>{s.icon}</Box>}
      label={s.label}
      size="small"
      sx={{
        bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`,
        fontWeight: 700, fontSize: '0.6875rem',
        '& .MuiChip-icon': { color: s.color },
      }}
    />
  );
}

// ─── Deviation Row (expandable) ───────────────────────────────────────────────
function DeviationRow({ deviation, index }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const s = SEVERITY[deviation.severity] ?? SEVERITY.low;

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          borderLeft: `4px solid ${s.color}`,
          '&:hover': { bgcolor: theme.palette.action.hover },
        }}
        onClick={() => setOpen((p) => !p)}
      >
        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 40 }}>{index + 1}</TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={700}>{deviation.clauseTitle}</Typography>
          <Typography variant="caption" color="text.secondary">{deviation.section}</Typography>
        </TableCell>
        <TableCell><SeverityBadge level={deviation.severity} /></TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 300, display: 'block' }} noWrap>
            {deviation.deviation}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <IconButton size="small">{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafa', borderBottom: 1, borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Enterprise Template</Typography>
                  <Box sx={{ mt: 0.5, p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', lineHeight: 1.6, color: '#14532d' }}>
                      {deviation.templateText}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Contract Text</Typography>
                  <Box sx={{ mt: 0.5, p: 1.5, bgcolor: '#fff1f1', border: '1px solid #ffb3b8', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', lineHeight: 1.6, color: '#7f1d1d' }}>
                      {deviation.contractText}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Deviation Detail</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{deviation.deviation}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Recommendation</Typography>
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <PriorityHighIcon sx={{ color: '#0f62fe', fontSize: 16, mt: 0.25, flexShrink: 0 }} />
                    <Typography variant="body2" color="primary" fontWeight={600}>{deviation.recommendation}</Typography>
                  </Box>
                </Grid>
                {deviation.impact && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      <Typography variant="body2"><strong>Business Impact:</strong> {deviation.impact}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─── Risk Breakdown Bar ────────────────────────────────────────────────────────
function RiskBreakdownBar({ item }) {
  const color = item.score >= 75 ? '#da1e28' : item.score >= 50 ? '#b45309' : item.score >= 25 ? '#f1c21b' : '#198038';
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{item.category}</Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color }}>{item.score}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={item.score}
        sx={{
          height: 6,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
    </Box>
  );
}

export default function ContractAnalysis() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulate AI analysis fetch with skeleton
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      // Persist the analysed contract ID so Reports page can pick it up
      // whether the user navigates there directly or refreshes the page.
      localStorage.setItem('contractId', dummyContract.id);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const contract = dummyContract;
  const summary = dummyExecutiveSummary;
  const risk = dummyRiskAssessment;
  const deviations = dummyDeviations;
  const recommendations = dummyRecommendations;

  if (loading) return <AnalysisSectionSkeleton />;

  const criticalCount = deviations.filter((d) => d.severity === 'critical').length;
  const highCount = deviations.filter((d) => d.severity === 'high').length;
  const mediumCount = deviations.filter((d) => d.severity === 'medium').length;
  const lowCount = deviations.filter((d) => d.severity === 'low').length;

  return (
    <Box>
      <SectionHeader
        title="Contract Analysis"
        subtitle={`AI Analysis — ${contract.title}`}
        action={
          <Button
            variant="contained"
            startIcon={<DownloadOutlinedIcon />}
            onClick={() => navigate('/reports', { state: { contractId: contract.id } })}
            sx={{ fontWeight: 700 }}
          >
            Export Report
          </Button>
        }
      />

      {/* Contract metadata bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <AssignmentOutlinedIcon sx={{ color: '#0f62fe', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Contract</Typography>
                  <Typography variant="body2" fontWeight={700}>{contract.title}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <BusinessOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{contract.contractType}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <AttachMoneyOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Value</Typography>
                  <Typography variant="body2" fontWeight={600}>{contract.contractValue}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <CalendarTodayOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Effective</Typography>
                  <Typography variant="body2">{contract.effectiveDate}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
              <StatusChip status={contract.status} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Top summary row: risk gauge + severity chips */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Risk gauge card */}
        <Grid item xs={12} sm={5} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Overall Risk Score
              </Typography>
              <RiskScoreGauge score={risk.overallScore} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Based on {deviations.length} clause deviations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Severity summary */}
        <Grid item xs={12} sm={7} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Deviation Severity
              </Typography>
              {[
                { label: 'Critical', count: criticalCount, color: '#da1e28', bg: '#fff1f1' },
                { label: 'High',     count: highCount,     color: '#b45309', bg: '#fff7ed' },
                { label: 'Medium',   count: mediumCount,   color: '#854d0e', bg: '#fef9c3' },
                { label: 'Low',      count: lowCount,      color: '#15803d', bg: '#f0fdf4' },
              ].map((s) => (
                <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                    <Typography variant="body2">{s.label}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(s.count / deviations.length) * 100}
                      sx={{
                        width: 80, height: 6,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': { bgcolor: s.color },
                      }}
                    />
                    <Typography variant="body2" fontWeight={700} sx={{ color: s.color, minWidth: 16 }}>{s.count}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Risk breakdown */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Risk by Category
              </Typography>
              {risk.breakdown.slice(0, 5).map((item) => (
                <RiskBreakdownBar key={item.category} item={item} />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs: Summary / Deviations / Recommendations */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ px: 2, '& .MuiTab-root': { fontWeight: 600, fontSize: '0.875rem' } }}
          >
            <Tab label="Executive Summary" />
            <Tab label={`Clause Deviations (${deviations.length})`} />
            <Tab label={`Recommendations (${recommendations.length})`} />
          </Tabs>
        </Box>

        {/* Tab 0 — Executive Summary */}
        {activeTab === 0 && (
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                p: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15,98,254,0.06)' : '#f0f7ff',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(15,98,254,0.3)' : '#bfdbfe',
                borderLeft: '4px solid #0f62fe',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <Chip
                  label="IBM Granite · AI Generated"
                  size="small"
                  sx={{ bgcolor: '#0f62fe', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }}
                />
                <Chip
                  label="watsonx Orchestrate"
                  size="small"
                  sx={{ bgcolor: '#8a3ffc', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }}
                />
              </Box>
              {summary.split('\n\n').map((para, i) => (
                <Typography key={i} variant="body1" paragraph sx={{ lineHeight: 1.8, '&:last-child': { mb: 0 } }}>
                  {para}
                </Typography>
              ))}
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { label: 'Contract ID', value: contract.id },
                { label: 'Parties', value: contract.parties.join(' · ') },
                { label: 'Effective Date', value: contract.effectiveDate },
                { label: 'Expiry Date', value: contract.expiryDate },
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.label}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>{item.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        )}

        {/* Tab 1 — Clause Deviations */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ px: 3, pt: 2, pb: 1 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{criticalCount + highCount} high-priority deviations</strong> require immediate legal review before contract execution.
              </Alert>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Clause</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Deviation Summary</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deviations.map((d, i) => (
                    <DeviationRow key={d.id} deviation={d} index={i} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2 — Recommendations */}
        {activeTab === 2 && (
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recommendations.map((rec) => {
                const statusColors = {
                  urgent: { bg: '#fff1f1', border: '#ffb3b8', color: '#da1e28' },
                  required: { bg: '#fff7ed', border: '#fcd34d', color: '#b45309' },
                  recommended: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
                };
                const sc = statusColors[rec.status] ?? statusColors.recommended;
                return (
                  <Box
                    key={rec.priority}
                    sx={{
                      display: 'flex', gap: 2, p: 2,
                      border: `1px solid ${sc.border}`,
                      bgcolor: sc.bg,
                      borderLeft: `4px solid ${sc.color}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        bgcolor: sc.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.25,
                      }}
                    >
                      {rec.priority}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: sc.color, mb: 0.5 }}>
                        {rec.action}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Owner:</strong> {rec.owner}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Deadline:</strong> {rec.deadline}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      size="small"
                      sx={{ bgcolor: 'transparent', border: `1px solid ${sc.color}`, color: sc.color, fontWeight: 700, fontSize: '0.65rem', alignSelf: 'flex-start' }}
                    />
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<DownloadOutlinedIcon />}
                onClick={() => navigate('/reports', { state: { contractId: contract.id } })}
                sx={{ fontWeight: 700 }}
              >
                Export Full Report
              </Button>
            </Box>
          </CardContent>
        )}
      </Card>
    </Box>
  );
}
