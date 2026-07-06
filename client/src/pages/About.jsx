import {
  Box, Grid, Card, CardContent, Typography, Button,
  Divider, Chip, List, ListItem, ListItemText, useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import SectionHeader from '../components/common/SectionHeader';

const TECH_STACK = [
  { category: 'Frontend',   items: ['React + Vite', 'Material UI', 'React Router v6', 'react-dropzone', 'Recharts'] },
  { category: 'Backend',    items: ['Node.js', 'Express.js', 'Multer', 'pdf-parse', 'mammoth.js', 'ExcelJS'] },
  { category: 'Database',   items: ['MongoDB Atlas', 'Mongoose ODM'] },
  { category: 'AI / IBM',   items: ['IBM watsonx Orchestrate', 'IBM Granite LLM', 'watsonx.ai RAG', 'Knowledge Base'] },
  { category: 'Deployment', items: ['Vercel (Frontend)', 'Render (Backend)', 'GitHub Actions CI/CD', 'MongoDB Atlas (Cloud)'] },
];

const WORKFLOW = [
  { step: '01', title: 'Contract Upload',     desc: 'Upload a PDF or DOCX vendor agreement through the drag-and-drop interface.', color: '#0f62fe' },
  { step: '02', title: 'Text Extraction',     desc: 'pdf-parse and mammoth.js extract raw contract text on the backend.', color: '#0072c3' },
  { step: '03', title: 'watsonx Orchestrate', desc: 'Extracted text is sent to IBM watsonx Orchestrate for multi-step AI analysis.', color: '#8a3ffc' },
  { step: '04', title: 'Granite Analysis',    desc: 'IBM Granite LLM compares each clause against the enterprise Standard Vendor Agreement template in the Knowledge Base.', color: '#9f1853' },
  { step: '05', title: 'Risk Scoring',        desc: 'Deviations are classified by severity (Critical / High / Medium / Low) and scored 0–100.', color: '#b45309' },
  { step: '06', title: 'Report Export',       desc: 'A formatted Excel report with 4 worksheets is generated and available for download.', color: '#198038' },
];

const TEAM = [
  { name: 'AI Contract Analysis Engine', role: 'IBM watsonx Orchestrate + IBM Granite', icon: <AutoAwesomeOutlinedIcon /> },
  { name: 'Enterprise Knowledge Base',   role: 'Standard Vendor Agreement + Clause Library', icon: <LibraryBooksOutlinedIcon /> },
  { name: 'Pipeline Orchestration',      role: 'Multi-step watsonx agent workflow', icon: <AccountTreeOutlinedIcon /> },
];

export default function About() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <SectionHeader
        title="About ContractIQ Sentinel"
        subtitle="IBM SkillsBuild Internship Project"
      />

      {/* Hero */}
      <Card
        sx={{
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, #161616 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #161616 0%, #262626 100%)',
          color: '#ffffff',
          borderRadius: 0,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Chip
            label="IBM SkillsBuild Internship Project"
            size="small"
            sx={{ bgcolor: '#0f62fe', color: '#fff', fontWeight: 700, fontSize: '0.7rem', mb: 2 }}
          />
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 300, mb: 1.5 }}>
            ContractIQ Sentinel
          </Typography>
          <Typography variant="body1" sx={{ color: '#c6c6c6', maxWidth: 640, lineHeight: 1.8, mb: 3 }}>
            An AI-powered Enterprise Contract Intelligence Platform built on IBM watsonx Orchestrate
            and IBM Granite. ContractIQ Sentinel enables legal and procurement teams to upload vendor
            contracts, detect clause deviations against enterprise-approved templates, assess contractual
            risks, and generate executive-ready Excel reports — all in minutes.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {['IBM watsonx Orchestrate', 'IBM Granite LLM', 'RAG Knowledge Base', 'React + Vite', 'Node.js', 'MongoDB'].map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#f4f4f4', fontWeight: 600, fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Workflow */}
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Application Workflow" subtitle="End-to-end AI contract review pipeline" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {WORKFLOW.map((item, idx) => (
                  <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: '50%',
                          bgcolor: item.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </Box>
                      {idx < WORKFLOW.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5, minHeight: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ pb: idx < WORKFLOW.length - 1 ? 2.5 : 0 }}>
                      <Typography variant="body1" fontWeight={700}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tech stack + AI components */}
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="AI Components" subtitle="Powered by IBM" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {TEAM.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: 'flex', gap: 2, p: 1.5,
                      border: 1, borderColor: 'divider',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ color: '#0f62fe', display: 'flex' }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.role}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Technology Stack" />
              {TECH_STACK.map((group) => (
                <Box key={group.category} sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">{group.category}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                    {group.items.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                <SchoolOutlinedIcon sx={{ color: '#0f62fe' }} />
                <Typography variant="h6" fontWeight={600}>IBM SkillsBuild</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                This project was developed as part of the IBM SkillsBuild Internship Programme,
                demonstrating enterprise-grade AI application development using IBM watsonx Orchestrate,
                IBM Granite LLMs, and the IBM watsonx platform.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => navigate('/upload')}
                sx={{ fontWeight: 700 }}
              >
                Try It — Upload a Contract
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
