# ContractIQ Sentinel — Server Architecture

## IBM SkillsBuild Internship Project

---

## Overview

ContractIQ Sentinel is an AI-powered enterprise contract intelligence platform. The backend is a Node.js + Express REST API that accepts uploaded contracts, extracts their text, sends it to IBM Granite for clause deviation analysis, and returns a structured JSON result covering risk scores, deviations, recommendations, and an executive summary.

---

## AI Integration Architecture

### Primary Production Engine — IBM Granite via watsonx.ai

IBM Granite (`ibm/granite-13b-instruct-v2`) accessed through the **official IBM watsonx.ai REST API** is the primary and production AI engine for this project.

```
POST {WATSONX_API_URL}/ml/v1/text/generation?version=2023-05-29
Authorization: Bearer {IAM_token}
```

The enterprise Standard Vendor Agreement clause requirements are embedded directly in the Granite system-level prompt (`granite.analysis.js`). This approach:
- Requires only `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` to operate
- Produces deterministic, auditable clause comparisons
- Works without any external agent deployment

### IBM watsonx Orchestrate — Solution Architecture Role

The IBM watsonx Orchestrate "Build with AI" agent created for this project is a central component of the **overall solution architecture** and demonstrates the complete IBM watsonx platform workflow — Knowledge Base (RAG), skill orchestration, and agent-based automation.

**Important:** Direct external REST invocation of Build with AI agents is **not assumed** in this implementation. IBM watsonx Orchestrate Build with AI agents must be **deployed to a Watson Assistant channel** before they expose a public REST interface. This deployment step is documented in `server/services/orchestrate.service.js`.

When that deployment is completed, Path 1 (Watson Assistant v2 API) activates automatically through environment variables — no code changes are required.

### Analysis Priority Chain

```
┌─────────────────────────────────────────────────────────────────────┐
│ PATH 1 — Watson Assistant v2 (deployed Orchestrate agent)           │
│   Requires: WATSONX_ORCHESTRATE_URL + WATSONX_ORCHESTRATE_AGENT_ID  │
│   Benefit:  Knowledge Base RAG with live Standard Vendor Agreement  │
│   API:      POST /v2/assistants/{id}/sessions/{sid}/message         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ not configured or fails
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PATH 2 — IBM Granite Direct (watsonx.ai REST) ← PRODUCTION DEFAULT  │
│   Requires: WATSONX_API_KEY + WATSONX_PROJECT_ID                    │
│   Benefit:  No agent deployment required; works immediately          │
│   API:      POST /ml/v1/text/generation                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ not configured or fails
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PATH 3 — Mock (development / demo)                                   │
│   Requires: USE_MOCK_ANALYSIS=true  OR  no credentials              │
│   Benefit:  Full pipeline testable without any IBM account           │
└─────────────────────────────────────────────────────────────────────┘
```

### Modularity Guarantee

The frontend, API controllers, and routes are **completely decoupled** from the AI provider. The entire service layer is contained in:

```
server/services/
├── iam.service.js          IBM Cloud IAM token exchange (shared by all paths)
├── granite.service.js      watsonx.ai text generation caller
├── granite.analysis.js     Granite prompt builder + response handler
├── orchestrate.service.js  Watson Assistant v2 session/message API
├── deviation.service.js    Priority chain dispatcher (the only file controllers call)
└── responseParser.js       Structured JSON extractor + normaliser
```

To switch the AI provider: **set environment variables only**. No controller, route, or frontend file changes are needed.

---

## Service Layer Map

```
contract.controller.js
        │
        ▼ calls
deviation.service.js  ──► Path 1: orchestrate.service.js ──► Watson Assistant v2 API
        │                                                       (Orchestrate Knowledge Base)
        ├──────────────► Path 2: granite.analysis.js ──────► granite.service.js
        │                                                       ──► iam.service.js
        │                                                       ──► watsonx.ai /ml/v1/text/generation
        │                                                       ──► responseParser.js
        │
        └──────────────► Path 3: buildMockResponse()
```

---

## Folder Structure

```
server/
├── config/
│   ├── db.js                   MongoDB Atlas connection
│   └── watsonx.js              IBM credential config + feature flags
├── controllers/
│   ├── contract.controller.js  Upload + analyse + list + delete
│   ├── analysis.controller.js  Retrieve analysis results
│   └── report.controller.js    Generate + download Excel reports
├── middleware/
│   ├── upload.middleware.js    Multer — PDF/DOCX file validation + storage
│   ├── validate.middleware.js  express-validator result handler
│   └── errorHandler.js        Centralised Express error handler
├── models/
│   ├── Contract.model.js       Contract metadata + extracted text
│   ├── Analysis.model.js       Full AI analysis result (deviations, risk, summary)
│   └── Report.model.js         Excel report metadata
├── routes/
│   ├── contract.routes.js      POST /upload, POST /analyze, GET /:id, DELETE /:id
│   ├── analysis.routes.js      GET /, GET /:contractId
│   ├── report.routes.js        POST /export, GET /:id, GET /:id/download
│   └── health.routes.js        GET /api/health
├── services/
│   ├── iam.service.js          IBM IAM token fetch + in-process cache
│   ├── granite.service.js      watsonx.ai text generation API caller
│   ├── granite.analysis.js     Granite prompt builder (enterprise standards embedded)
│   ├── orchestrate.service.js  Watson Assistant v2 session/message API
│   ├── deviation.service.js    Priority chain dispatcher (Orchestrate → Granite → Mock)
│   ├── responseParser.js       LLM JSON extractor + field normaliser
│   ├── parser.service.js       pdf-parse + mammoth text extraction
│   └── excel.service.js        ExcelJS 4-sheet deviation report generator
├── utils/
│   ├── asyncHandler.js         Async route wrapper (forwards rejections to next(err))
│   ├── responseHelper.js       Standardised JSON response envelope
│   └── fileUtils.js            ensureDir, safeUnlink, formatBytes
├── uploads/                    Temporary contract file storage
├── app.js                      Express app (middleware + routes + error handler)
└── server.js                   Bootstrap: MongoDB connect + HTTP listen + graceful shutdown
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Liveness probe — DB state + AI config status |
| `POST` | `/api/contracts/upload` | Upload PDF/DOCX contract |
| `POST` | `/api/contracts/analyze` | Extract text + run AI analysis |
| `GET`  | `/api/contracts` | List all contracts (paginated) |
| `GET`  | `/api/contracts/:id` | Get contract + linked analysis |
| `DELETE` | `/api/contracts/:id` | Delete contract + analysis |
| `GET`  | `/api/analysis` | List all analyses (paginated) |
| `GET`  | `/api/analysis/:contractId` | Get analysis by contract ID |
| `POST` | `/api/reports/export` | Generate Excel report |
| `GET`  | `/api/reports/:id` | Get report metadata |
| `GET`  | `/api/reports/:id/download` | Stream .xlsx file download |

---

## Environment Variables

```env
# ── IBM Granite / watsonx.ai (required for live AI) ──────────────────
WATSONX_API_KEY=           # IBM Cloud API key
WATSONX_PROJECT_ID=        # watsonx.ai project ID
WATSONX_API_URL=           # https://us-south.ml.cloud.ibm.com (default)
WATSONX_MODEL_ID=          # ibm/granite-13b-instruct-v2 (default)

# ── Watson Assistant / Orchestrate (optional — activates Path 1) ─────
WATSONX_ORCHESTRATE_URL=        # Watson Assistant service URL
WATSONX_ORCHESTRATE_AGENT_ID=   # Watson Assistant assistant ID

# ── MongoDB ────────────────────────────────────────────────────────────
MONGO_URI=                 # MongoDB Atlas connection string
PORT=5000
NODE_ENV=development

# ── Development controls ───────────────────────────────────────────────
USE_MOCK_ANALYSIS=false    # Set true to skip all IBM calls (demo mode)
CLIENT_URL=http://localhost:3000
```

---

## Response Envelope

All API responses follow a consistent JSON structure:

```json
// Success
{ "success": true,  "message": "...", "data": { ... } }

// Error
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```
