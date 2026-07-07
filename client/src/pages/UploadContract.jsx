import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Stepper, Step, StepLabel, LinearProgress, Alert,
  Divider, List, ListItem, ListItemIcon, ListItemText,
  Chip, CircularProgress, useTheme,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SectionHeader from '../components/common/SectionHeader';
import UploadIllustration from '../components/common/UploadIllustration';
import { uploadContract, analyzeContract } from '../api/contracts.api';

const STEPS = ['Select File', 'Review Details', 'Run Analysis'];
const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const SUPPORTED_TYPES = [
  { icon: <DescriptionOutlinedIcon />, label: 'PDF Documents', ext: '.pdf' },
  { icon: <ArticleOutlinedIcon />, label: 'Word Documents', ext: '.docx' },
];

// Progress stages shown in the UI during analysis
const ANALYSIS_STAGES = [
  { pct: 10, label: 'Uploading contract to server…' },
  { pct: 25, label: 'Extracting contract text…' },
  { pct: 45, label: 'Parsing clause structure…' },
  { pct: 60, label: 'Sending to IBM watsonx Orchestrate…' },
  { pct: 78, label: 'IBM Granite comparing against enterprise template…' },
  { pct: 92, label: 'Generating risk assessment…' },
  { pct: 100, label: 'Analysis complete!' },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FilePreview({ file, onRemove }) {
  const theme = useTheme();
  const ext = file.name.split('.').pop().toUpperCase();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        border: 1,
        borderColor: 'primary.main',
        borderRadius: 1,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15,98,254,0.1)' : '#eff6ff',
      }}
    >
      <Box
        sx={{
          width: 44, height: 44, borderRadius: 1,
          bgcolor: '#0f62fe', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" fontWeight={700} fontSize="0.65rem">{ext}</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{file.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {formatBytes(file.size)} · Uploaded {new Date().toLocaleDateString()}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip label="Ready" size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 700, border: '1px solid #86efac', fontSize: '0.65rem' }} />
        <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={onRemove}>
          Remove
        </Button>
      </Box>
    </Box>
  );
}

export default function UploadContract() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [rejectionError, setRejectionError] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisError, setAnalysisError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setRejectionError('');
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') setRejectionError('File exceeds the 20 MB size limit.');
      else if (err.code === 'file-invalid-type') setRejectionError('Only PDF and DOCX files are supported.');
      else setRejectionError('Invalid file. Please upload a PDF or DOCX document.');
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setActiveStep(1);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const handleRemoveFile = () => {
    setFile(null);
    setActiveStep(0);
    setRejectionError('');
    setAnalysisError('');
  };

  /**
   * Advances the progress bar to a target percentage over ~600 ms.
   * Returns a promise that resolves when the animation finishes.
   */
  const advanceTo = (targetPct, label) =>
    new Promise((resolve) => {
      setAnalysisStep(label);
      setAnalysisProgress(targetPct);
      setTimeout(resolve, 650);
    });

  /**
   * Real analysis flow:
   * 1. POST /api/contracts/upload  → get MongoDB _id
   * 2. POST /api/contracts/analyze → run AI analysis
   * 3. Persist _id to localStorage and navigate to /analysis with _id in state
   */
  const runAnalysis = async () => {
    if (!file) return;

    setIsAnalysing(true);
    setAnalysisError('');
    setActiveStep(2);

    try {
      // Stage 1 — upload
      await advanceTo(ANALYSIS_STAGES[0].pct, ANALYSIS_STAGES[0].label);
      const uploadResult = await uploadContract(file);
      const mongoId = uploadResult.contractId; // MongoDB ObjectId string

      // Stage 2-3 — visual progress while waiting for text extraction
      await advanceTo(ANALYSIS_STAGES[1].pct, ANALYSIS_STAGES[1].label);
      await advanceTo(ANALYSIS_STAGES[2].pct, ANALYSIS_STAGES[2].label);

      // Stage 4 — trigger AI analysis (this is the long-running call)
      await advanceTo(ANALYSIS_STAGES[3].pct, ANALYSIS_STAGES[3].label);
      await analyzeContract(mongoId);

      // Stage 5-7 — visual completion stages
      await advanceTo(ANALYSIS_STAGES[4].pct, ANALYSIS_STAGES[4].label);
      await advanceTo(ANALYSIS_STAGES[5].pct, ANALYSIS_STAGES[5].label);
      await advanceTo(ANALYSIS_STAGES[6].pct, ANALYSIS_STAGES[6].label);

      // Persist MongoDB _id so Reports can use it even after page refresh
      localStorage.setItem('contractId', mongoId);

      // Navigate to the analysis page, carrying the MongoDB _id in router state
      setTimeout(() => navigate('/analysis', { state: { contractId: mongoId } }), 400);

    } catch (err) {
      setIsAnalysing(false);
      setActiveStep(1);
      setAnalysisError(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Analysis failed. Please check your connection and try again.'
      );
    }
  };

  const dropBorderColor = isDragReject
    ? theme.palette.error.main
    : isDragActive
    ? '#0f62fe'
    : theme.palette.divider;

  const dropBg = isDragActive
    ? theme.palette.mode === 'dark' ? 'rgba(15,98,254,0.1)' : '#eff6ff'
    : 'transparent';

  return (
    <Box>
      <SectionHeader
        title="Upload Contract"
        subtitle="Upload a vendor agreement for AI-powered clause deviation analysis"
      />

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Left — Upload area */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {!isAnalysing ? (
                <>
                  {/* Drop zone */}
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: `2px dashed ${dropBorderColor}`,
                      borderRadius: 1,
                      p: { xs: 3, sm: 4 },
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: dropBg,
                      transition: 'all 0.22s ease',
                      '&:hover': {
                        borderColor: '#0f62fe',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15,98,254,0.08)' : '#f0f7ff',
                        '& .upload-illustration': { transform: 'translateY(-6px)', opacity: 1 },
                      },
                    }}
                  >
                    <input {...getInputProps()} />

                    {/* Illustration */}
                    <Box
                      className="upload-illustration"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        transition: 'transform 0.3s ease, opacity 0.3s ease',
                        opacity: isDragActive ? 1 : 0.85,
                        transform: isDragActive ? 'translateY(-6px)' : 'none',
                      }}
                    >
                      <UploadIllustration
                        width={180}
                        isDark={theme.palette.mode === 'dark'}
                      />
                    </Box>

                    {isDragActive ? (
                      <Box>
                        <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
                          Drop your contract here…
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ opacity: 0.75 }}>
                          Release to upload PDF or DOCX
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          Drag & drop your contract here
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Supports <strong>PDF</strong> and <strong>DOCX</strong> — up to 20 MB
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2 }}>
                          <Button variant="contained" sx={{ fontWeight: 700 }}>
                            Browse Files
                          </Button>
                          <Button variant="outlined" sx={{ fontWeight: 600 }}>
                            Use Demo Contract
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>

                  {rejectionError && (
                    <Alert severity="error" sx={{ mt: 2 }}>{rejectionError}</Alert>
                  )}

                  {analysisError && (
                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => setAnalysisError('')}>
                      {analysisError}
                    </Alert>
                  )}

                  {/* File preview */}
                  {file && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="overline" color="text.secondary">Selected File</Typography>
                      <Box sx={{ mt: 1 }}>
                        <FilePreview file={file} onRemove={handleRemoveFile} />
                      </Box>
                    </Box>
                  )}

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button variant="outlined" onClick={handleRemoveFile} disabled={!file}>
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      onClick={runAnalysis}
                      disabled={!file}
                      sx={{ fontWeight: 700, minWidth: 180 }}
                    >
                      Run AI Analysis
                    </Button>
                  </Box>
                </>
              ) : (
                /* Analysis progress */
                <Box sx={{ py: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CircularProgress size={56} thickness={3} sx={{ color: '#0f62fe', mb: 2 }} />
                    <Typography variant="h5" fontWeight={400} gutterBottom>
                      Analysing Contract
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      IBM watsonx Orchestrate is reviewing your contract…
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{analysisStep}</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      {analysisProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysisProgress}
                    sx={{ height: 6, mb: 3 }}
                  />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      'Extracting contract text',
                      'Parsing clause structure',
                      'IBM watsonx Orchestrate review',
                      'IBM Granite deviation analysis',
                      'Risk scoring',
                    ].map((step, i) => {
                      const stepPct = (i + 1) * 20;
                      const done = analysisProgress >= stepPct;
                      return (
                        <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {done ? (
                            <CheckCircleOutlineIcon sx={{ color: '#198038', fontSize: 18 }} />
                          ) : (
                            <Box
                              sx={{
                                width: 18, height: 18, borderRadius: '50%',
                                border: '2px solid', borderColor: 'divider',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{ color: done ? 'text.primary' : 'text.secondary', fontWeight: done ? 600 : 400 }}
                          >
                            {step}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right — Guidelines panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" gutterBottom>Supported Formats</Typography>
              <List dense disablePadding>
                {SUPPORTED_TYPES.map(({ icon, label, ext }) => (
                  <ListItem key={ext} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36, color: '#0f62fe' }}>{icon}</ListItemIcon>
                    <ListItemText
                      primary={label}
                      secondary={ext}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                Maximum file size: <strong>20 MB</strong>
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" gutterBottom>What the AI Analyses</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {[
                  'Limitation of Liability clauses',
                  'Indemnification obligations',
                  'Payment and billing terms',
                  'Intellectual property rights',
                  'Termination conditions',
                  'Data privacy & security',
                  'Confidentiality obligations',
                  'Governing law & jurisdiction',
                ].map((item) => (
                  <Box key={item} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleOutlineIcon sx={{ color: '#0f62fe', fontSize: 16, mt: 0.25, flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">{item}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
