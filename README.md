<div align="center">

# ContractIQ Sentinel

### AI-Powered Enterprise Contract Intelligence Platform

*Powered by IBM watsonx Orchestrate · IBM Granite · MongoDB Atlas*

[![CI](https://github.com/YOUR_ORG/contractiq-sentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/contractiq-sentinel/actions)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![IBM watsonx](https://img.shields.io/badge/IBM-watsonx-0f62fe?logo=ibm)](https://www.ibm.com/watsonx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

**ContractIQ Sentinel** is an enterprise-grade AI platform that empowers legal and procurement teams to upload contracts, compare them against enterprise-approved standards, detect clause deviations, assess contractual risks, and generate executive-ready reports — all powered by **IBM Granite** language models via **IBM watsonx.ai**.

> Built as an IBM SkillsBuild Internship Project demonstrating the IBM watsonx platform in a real-world enterprise scenario.

---

## Screenshots

> *Replace the placeholders below with actual screenshots after deployment.*

| Home Dashboard | Contract Upload | AI Analysis |
|---|---|---|
| `screenshots/home.png` | `screenshots/upload.png` | `screenshots/analysis.png` |

| Reports & Export | About |
|---|---|
| `screenshots/reports.png` | `screenshots/about.png` |

---

## Features

| Feature | Description |
|---|---|
| 📄 **Contract Upload** | Upload PDF or DOCX contracts with drag-and-drop. Text is extracted server-side using `pdf-parse` and `mammoth`. |
| 🤖 **AI-Powered Analysis** | IBM Granite (`ibm/granite-13b-instruct-v2`) analyses contracts for clause deviations, risk factors, and recommendations. |
| 🎯 **Deviation Detection** | Compares clauses against 8 enterprise-approved clause standards and flags critical, high, medium, and low risk items. |
| 📊 **Risk Scoring** | Animated gauge visualisation with risk breakdown across liability, payment, IP, compliance, and termination domains. |
| 📝 **Executive Summaries** | AI-generated summaries with key findings and recommended actions. |
| 📥 **Excel Export** | Professional 4-sheet Excel workbook (Summary, Deviations, Recommendations, Risk Breakdown) generated via ExcelJS. |
| 🌙 **Dark Mode** | Full IBM-inspired light/dark theme toggle across all pages. |
| ⚡ **Mock Mode** | `USE_MOCK_ANALYSIS=true` bypasses AI calls for demos and testing. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ContractIQ Sentinel                          │
├──────────────────────────┬──────────────────────────────────────────┤
│  Frontend (Vercel)       │  Backend (Render)                        │
│                          │                                          │
│  React 19 + Vite         │  Node.js 20 + Express                   │
│  Material UI v9          │  MVC Architecture                        │
│  React Router v7         │  Multer (file upload)                    │
│  Recharts                │  pdf-parse + mammoth                     │
│  Axios                   │  ExcelJS (report generation)             │
│                          │  Mongoose (MongoDB ODM)                  │
├──────────────────────────┼──────────────────────────────────────────┤
│                          │  AI Service Chain                        │
│                          │  ┌──────────────────────────────────┐   │
│                          │  │  1. IBM watsonx Orchestrate       │   │
│                          │  │     (Watson Assistant v2 channel) │   │
│                          │  │  ↓ fallback                       │   │
│                          │  │  2. IBM Granite (watsonx.ai REST) │   │
│                          │  │  ↓ fallback                       │   │
│                          │  │  3. Mock Response (demo/testing)  │   │
│                          │  └──────────────────────────────────┘   │
├──────────────────────────┴──────────────────────────────────────────┤
│  Database: MongoDB Atlas                                            │
│  Collections: contracts · analyses · reports                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| Material UI | 9 | Component library (IBM theme) |
| React Router DOM | 7 | Client-side routing (SPA) |
| Recharts | 3 | Risk chart visualisations |
| Axios | 1 | HTTP client with interceptors |
| React Dropzone | 15 | File upload UX |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | JavaScript runtime |
| Express | 4 | REST API framework |
| Mongoose | 8 | MongoDB ODM |
| Multer | 1 | Multipart file handling |
| ExcelJS | 4 | Excel workbook generation |
| pdf-parse | 1 | PDF text extraction |
| mammoth | 1 | DOCX text extraction |
| Helmet | 7 | HTTP security headers |
| Morgan | 1 | HTTP request logging |

### IBM Technologies
| Technology | Role |
|---|---|
| **IBM watsonx.ai** | Hosts Granite LLM; provides REST inference API |
| **IBM Granite 13B Instruct** | Primary AI model for contract analysis |
| **IBM watsonx Orchestrate** | Agent orchestration layer (Watson Assistant v2 channel) |
| **IBM IAM** | API key authentication for watsonx.ai token exchange |
| **IBM Cloud** | Hosts watsonx platform infrastructure |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting (CDN, edge network) |
| Render | Backend hosting (Node.js web service) |
| MongoDB Atlas | Managed cloud database |
| GitHub Actions | CI/CD (lint, build, syntax check) |

---

## Project Structure

```
contractiq-sentinel/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline
├── client/                      # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                 # Axios API layer
│   │   │   ├── axiosInstance.js
│   │   │   ├── contracts.api.js
│   │   │   ├── analysis.api.js
│   │   │   ├── reports.api.js
│   │   │   └── health.api.js
│   │   ├── components/
│   │   │   ├── layout/          # AppShell, Sidebar, TopBar
│   │   │   └── common/          # Logo, RiskGauge, Skeletons, etc.
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/               # 5 application pages
│   │   │   ├── Home.jsx
│   │   │   ├── UploadContract.jsx
│   │   │   ├── ContractAnalysis.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── About.jsx
│   │   ├── theme/
│   │   │   └── muiTheme.js
│   │   └── routes/
│   │       └── AppRouter.jsx
│   ├── .env.development         # Local env (empty VITE_API_URL — uses proxy)
│   ├── .env.production          # Production API URL
│   └── vite.config.js
├── server/                      # Node.js + Express backend
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── watsonx.js           # IBM credentials
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── iam.service.js       # IBM IAM token exchange
│   │   ├── granite.service.js   # watsonx.ai REST caller
│   │   ├── granite.analysis.js  # Prompt builder
│   │   ├── orchestrate.service.js
│   │   ├── deviation.service.js # AI priority chain
│   │   ├── responseParser.js    # LLM JSON extractor
│   │   ├── parser.service.js    # PDF/DOCX extraction
│   │   └── excel.service.js     # Excel workbook builder
│   ├── utils/
│   ├── uploads/                 # Uploaded contract files (git-ignored)
│   ├── reports/                 # Generated Excel files (git-ignored)
│   ├── .env.example             # Environment variable template
│   ├── app.js
│   ├── server.js
│   └── seed.js                  # MongoDB seed data
├── vercel.json                  # Vercel deployment config
├── render.yaml                  # Render deployment config
├── DEPLOYMENT.md                # Full deployment guide
└── README.md
```

---

## Local Development Setup

### Prerequisites

- **Node.js** 20 LTS → [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** account → [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- **IBM Cloud** account with watsonx.ai access → [cloud.ibm.com](https://cloud.ibm.com)
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/contractiq-sentinel.git
cd contractiq-sentinel
```

### 2. Configure backend environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `WATSONX_API_KEY` — IBM Cloud API key
- `WATSONX_PROJECT_ID` — watsonx.ai project ID

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Seed the database (optional)

```bash
cd server && npm run seed
```

### 5. Start the development servers

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
# UI running at http://localhost:3000
```

Visit **http://localhost:3000** to open the application.

---

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full step-by-step deployment guide covering:
- MongoDB Atlas cluster setup
- Render backend deployment
- Vercel frontend deployment
- GitHub Actions CI/CD
- Post-deployment health checks

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `WATSONX_API_KEY` | Yes* | IBM Cloud API key |
| `WATSONX_PROJECT_ID` | Yes* | watsonx.ai project ID |
| `WATSONX_API_URL` | No | IBM region URL (default: `us-south.ml.cloud.ibm.com`) |
| `WATSONX_MODEL_ID` | No | Granite model ID (default: `ibm/granite-13b-instruct-v2`) |
| `WATSONX_ORCHESTRATE_URL` | No | Watson Assistant v2 endpoint |
| `WATSONX_ORCHESTRATE_AGENT_ID` | No | Deployed Orchestrate agent ID |
| `CLIENT_URL` | Yes | Frontend URL for CORS (production: Vercel URL) |
| `USE_MOCK_ANALYSIS` | No | `true` to use mock AI responses |

> *Required for live AI analysis. Set `USE_MOCK_ANALYSIS=true` to run without IBM credentials.

### Frontend (`client/.env.production`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full backend API URL (e.g., `https://your-service.onrender.com/api`) |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — server + DB + AI status |
| `POST` | `/api/contracts/upload` | Upload a contract file (PDF/DOCX) |
| `POST` | `/api/contracts/:id/analyze` | Trigger AI analysis on a contract |
| `GET` | `/api/contracts` | List all contracts |
| `GET` | `/api/contracts/:id` | Get a specific contract |
| `DELETE` | `/api/contracts/:id` | Delete a contract |
| `GET` | `/api/analysis/:contractId` | Get analysis for a contract |
| `GET` | `/api/analysis` | List all analyses |
| `POST` | `/api/reports/export` | Generate and export Excel report |
| `GET` | `/api/reports` | List all generated reports |
| `GET` | `/api/reports/:id/download` | Download an Excel report |

---

## Contributing

This is an IBM SkillsBuild internship project. For questions or improvements, open an issue or pull request.

---

## License

[MIT License](LICENSE) — © IBM SkillsBuild Internship Project

---

<div align="center">
  <sub>Built with IBM watsonx · IBM Granite · React · Node.js · MongoDB</sub>
</div>
