import { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, LinearProgress, Divider, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  Skeleton, useTheme, Tooltip,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SectionHeader from '../components/common/SectionHeader';
import StatusChip from '../components/common/StatusChip';
import ErrorBanner from '../components/common/ErrorBanner';
import { exportReport, listReports, getDownloadUrl } from '../api/reports.api';
import { dummyDeviations } from '../data/dummyData';

// ─── Constants ────────────────────────────────────────────────────────────────
// Demo contract ID — in production this comes from the ContractAnalysis page state
// or a URL param. Hardcoded here so the Reports page works standalone.
const DEMO_CONTRACT_ID = null;   // null → shows "select a contract" prompt

const SHEET_DEFS = [
  {
    icon:  <SummarizeOutlinedIcon />,
    label: 'Executive Summary',
    desc:  'Contract metadata, overall risk score, and AI-generated executive summary',
  },
  {
    icon:  <WarningAmberOutlinedIcon />,
    label: 'Clause Deviations',
    desc:  'Full clause-by-clause comparison — standard template vs. contract text, severity, recommendation',
  },
  {
    icon:  <TableChartOutlinedIcon />,
    label: 'Risk Assessment',
    desc:  'Risk category scores with colour-coded severity and score-visualisation bars',
  },
  {
    icon:  <CheckCircleOutlineIcon />,
    label: 'Recommendations',
    desc:  'Prioritised action items with owner, deadline and status colour coding',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBar({ score }) {
  const color =
    score >= 75 ? '#da1e28' :
    score >= 50 ? '#b45309' :
    score >= 25 ? '#f1c21b' : '#198038';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1, height: 6, minWidth: 60,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 24 }}>
        {score}
      </Typography>
    </Box>
  );
}

function ReportHistorySkeleton() {
  return (
    <>
      {[1, 2, 3].map((n) => (
        <TableRow key={n}>
          {[200, 80, 100, 50, 120].map((w, i) => (
            <TableCell key={i}>
              <Skeleton variant="text" width={w} height={18} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Reports() {
  const theme   = useTheme();

  // ── Generate state ─────────────────────────────────────────────────────────
  const [generating,    setGenerating]    = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null); // { reportId, fileName, riskScore, riskLevel, downloadUrl }

  // ── History state ──────────────────────────────────────────────────────────
  const [reports,       setReports]       = useState([]);
  const [historyLoading,setHistoryLoading]= useState(true);
  const [historyError,  setHistoryError]  = useState('');

  // ── Preview dialog ─────────────────────────────────────────────────────────
  const [previewOpen,   setPreviewOpen]   = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  // ── Download tracking (reportId → loading boolean) ────────────────────────
  const [downloading, setDownloading]     = useState({});

  // ─── Load report history ─────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const data = await listReports();
      setReports(data?.reports || []);
    } catch (err) {
      setHistoryError(err.message || 'Failed to load report history.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // ─── Generate Excel report ────────────────────────────────────────────────
  const handleGenerate = async (contractId) => {
    if (!contractId) {
      setGenerateError('No contract selected. Please run a contract analysis first, then return to this page.');
      return;
    }
    setGenerating(true);
    setGenerateError('');
    setGeneratedReport(null);
    try {
      const result = await exportReport(contractId);
      setGeneratedReport(result);
      // Refresh history to show new report
      loadHistory();
    } catch (err) {
      setGenerateError(err.message || 'Report generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // ─── Download .xlsx ───────────────────────────────────────────────────────
  const handleDownload = (reportId, fileName) => {
    setDownloading((p) => ({ ...p, [reportId]: true }));
    const url  = getDownloadUrl(reportId);
    const link = document.createElement('a');
    link.href       = url;
    link.download   = fileName || `ContractIQ_Report_${reportId}.xlsx`;
    link.target     = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading((p) => ({ ...p, [reportId]: false })), 2000);
  };

  // ─── Preview dialog ───────────────────────────────────────────────────────
  const handlePreview = (report) => {
    setPreviewReport(report);
    setPreviewOpen(true);
  };

  // ─── Normalise report fields (handles both API + dummy data shapes) ───────
  const normalise = (r) => ({
    id:           r._id || r.id,
    contractTitle:r.contractTitle || r.contractId?.title || 'Unknown Contract',
    fileName:     r.fileName || `ContractIQ_Report_${r._id || r.id}.xlsx`,
    generatedAt:  r.generatedAt,
    riskScore:    r.riskScore ?? 0,
    riskLevel:    r.riskLevel || 'low',
    deviationCount: r.deviationCount ?? r.deviations ?? 0,
    reportStatus: r.reportStatus || 'ready',
  });

  return (
    <Box>
      <SectionHeader
        title="Reports & Export"
        subtitle="Generate and download AI-powered contract deviation reports in Excel format"
      />

      <Grid container spacing={3}>
        {/* ─── Left column: Generate panel ──────────────────────────────── */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Generate Excel Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate a formatted .xlsx workbook containing all 4 worksheets from
                the contract analysis.
              </Typography>

              {/* Worksheet preview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Report Contents — 4 Worksheets
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {SHEET_DEFS.map((sheet) => (
                    <Box
                      key={sheet.label}
                      sx={{
                        display: 'flex', gap: 1.5, p: 1.5,
                        border: 1, borderColor: 'divider',
                        bgcolor: 'background.default',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ color: '#0f62fe', mt: 0.25, flexShrink: 0 }}>{sheet.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{sheet.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{sheet.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Error */}
              {generateError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGenerateError('')}>
                  {generateError}
                </Alert>
              )}

              {/* Success state */}
              {generatedReport && !generating && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <strong>Report generated!</strong> — {generatedReport.fileName}
                </Alert>
              )}

              {/* Action buttons */}
              {!generating && !generatedReport && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={() => handleGenerate(DEMO_CONTRACT_ID)}
                  sx={{ fontWeight: 700 }}
                >
                  Generate Excel Report
                </Button>
              )}

              {generating && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <CircularProgress size={28} sx={{ color: '#0f62fe', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Generating report — building 4 worksheets…
                  </Typography>
                  <LinearProgress sx={{ mt: 1.5, height: 4 }} />
                </Box>
              )}

              {generatedReport && !generating && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={
                      downloading[generatedReport.reportId]
                        ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                        : <DownloadOutlinedIcon />
                    }
                    sx={{ flex: 1, fontWeight: 700 }}
                    onClick={() => handleDownload(generatedReport.reportId, generatedReport.fileName)}
                    disabled={!!downloading[generatedReport.reportId]}
                  >
                    Download .xlsx
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setGeneratedReport(null)}
                  >
                    New Report
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Format info card */}
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="overline" color="text.secondary">Format Details</Typography>
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Format',       value: 'Microsoft Excel (.xlsx)' },
                  { label: 'Worksheets',   value: '4 (Summary, Deviations, Risk, Recs)' },
                  { label: 'Formatting',   value: 'IBM design system colours + cell borders' },
                  { label: 'Severity',     value: 'Critical=Red · High=Orange · Medium=Yellow · Low=Green' },
                  { label: 'AI Engine',    value: 'IBM Granite · watsonx.ai' },
                  { label: 'Compatibility',value: 'Excel 2016+, Google Sheets, LibreOffice' },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ textAlign: 'right', maxWidth: '55%' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Right column: History table ───────────────────────────────── */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <SectionHeader
                  title="Report History"
                  subtitle="Previously generated reports"
                  sx={{ mb: 0, borderBottom: 0, pb: 0, flex: 1 }}
                />
                <Tooltip title="Refresh history">
                  <span>
                    <Button
                      size="small"
                      onClick={loadHistory}
                      disabled={historyLoading}
                      startIcon={historyLoading
                        ? <CircularProgress size={14} />
                        : <RefreshOutlinedIcon fontSize="small" />}
                    >
                      Refresh
                    </Button>
                  </span>
                </Tooltip>
              </Box>

              {historyError && (
                <Box sx={{ px: 2.5, pt: 1 }}>
                  <ErrorBanner
                    title="Failed to load reports"
                    message={historyError}
                    onRetry={loadHistory}
                  />
                </Box>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contract</TableCell>
                      <TableCell>Generated</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Deviations</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyLoading ? (
                      <ReportHistorySkeleton />
                    ) : reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No reports generated yet. Upload and analyse a contract to get started.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((rawReport) => {
                        const r = normalise(rawReport);
                        const isDownloading = !!downloading[r.id];
                        return (
                          <TableRow key={r.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                                {r.contractTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 200 }}>
                                {r.fileName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(r.generatedAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(r.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 110 }}>
                              <RiskBar score={r.riskScore} />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={r.deviationCount}
                                size="small"
                                sx={{ fontWeight: 700, minWidth: 28 }}
                                color={r.deviationCount >= 6 ? 'error' : r.deviationCount >= 3 ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Preview report contents">
                                  <Button
                                    size="small"
                                    startIcon={<PreviewOutlinedIcon />}
                                    onClick={() => handlePreview(r)}
                                  >
                                    Preview
                                  </Button>
                                </Tooltip>
                                <Tooltip title={r.reportStatus !== 'ready' ? 'Report not ready' : 'Download .xlsx'}>
                                  <span>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={
                                        isDownloading
                                          ? <CircularProgress size={12} />
                                          : <DownloadOutlinedIcon />
                                      }
                                      disabled={r.reportStatus !== 'ready' || isDownloading}
                                      onClick={() => handleDownload(r.id, r.fileName)}
                                    >
                                      .xlsx
                                    </Button>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Preview dialog ─────────────────────────────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            Report Preview
            {previewReport && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {previewReport.contractTitle}
              </Typography>
            )}
          </Box>
          {previewReport && <StatusChip status={previewReport.riskLevel} />}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {previewReport && (
            <Box>
              <Alert severity="info" sx={{ mb: 2.5, fontSize: '0.8rem' }}>
                This is an in-browser preview of the report structure. Download the <strong>.xlsx</strong> file
                to view the fully formatted workbook with IBM design system colours, cell borders, and all 4 worksheets.
              </Alert>

              {/* Sheet 1 preview */}
              <Typography variant="overline" color="text.secondary">Sheet 1 — Executive Summary</Typography>
              <Box
                sx={{
                  mt: 0.5, mb: 2.5, p: 2,
                  border: '2px solid',
                  borderColor: '#0f62fe',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(15,98,254,0.05)' : '#eff6ff',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {[
                    { k: 'Contract',    v: previewReport.contractTitle },
                    { k: 'Risk Score',  v: `${previewReport.riskScore} / 100 — ${(previewReport.riskLevel || '').toUpperCase()}` },
                    { k: 'Deviations', v: String(previewReport.deviationCount) },
                    { k: 'AI Engine',  v: 'IBM Granite · ibm/granite-13b-instruct-v2 · watsonx.ai' },
                  ].map(({ k, v }) => (
                    <Box key={k} sx={{ display: 'flex', gap: 2, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" fontWeight={700} sx={{ minWidth: 90, color: 'text.secondary' }}>{k}</Typography>
                      <Typography variant="caption">{v}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Sheet 2 preview — first 3 deviations */}
              <Typography variant="overline" color="text.secondary">Sheet 2 — Clause Deviations (first 3 rows)</Typography>
              <TableContainer sx={{ mt: 0.5, mb: 2.5, border: 1, borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#161616' }}>
                      {['#', 'Clause Name', 'Section', 'Severity', 'Recommendation'].map((h) => (
                        <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem', py: 0.75 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dummyDeviations.slice(0, 3).map((d, i) => (
                      <TableRow key={i} sx={{ bgcolor: i % 2 === 1 ? '#f4f4f4' : '#fff' }}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{d.clauseTitle}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{d.section}</TableCell>
                        <TableCell><StatusChip status={d.severity} /></TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', maxWidth: 160 }}>
                          <Typography variant="caption" noWrap sx={{ display: 'block' }}>{d.recommendation}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Sheet 3 + 4 thumbnails */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {['Sheet 3 — Risk Assessment', 'Sheet 4 — Recommendations'].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      flex: 1, minWidth: 200, p: 2,
                      border: 1, borderColor: 'divider', bgcolor: 'background.default',
                      display: 'flex', flexDirection: 'column', gap: 0.75,
                    }}
                  >
                    <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{label}</Typography>
                    {[1, 2, 3].map((n) => (
                      <Skeleton key={n} variant="rectangular" height={12} width={`${60 + n * 10}%`} sx={{ borderRadius: 0.5 }} />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {previewReport && previewReport.id && (
            <Button
              variant="contained"
              startIcon={
                downloading[previewReport.id]
                  ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                  : <DownloadOutlinedIcon />
              }
              disabled={!!downloading[previewReport.id] || previewReport.reportStatus !== 'ready'}
              onClick={() => handleDownload(previewReport.id, previewReport.fileName)}
              sx={{ fontWeight: 700 }}
            >
              Download .xlsx
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
