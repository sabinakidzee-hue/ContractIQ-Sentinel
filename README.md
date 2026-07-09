# ContractIQ Sentinel

> **AI-Powered Enterprise Contract Intelligence Platform**

ContractIQ Sentinel is an AI-powered enterprise solution that automates contract review by leveraging **IBM watsonx Orchestrate**, **IBM Granite**, and modern cloud technologies. The platform analyzes uploaded contracts, detects clause deviations, assesses legal risks, generates executive summaries, and produces enterprise-ready Excel reports.

---

## Overview

Manual contract review is often time-consuming, error-prone, and inconsistent. ContractIQ Sentinel streamlines this process using AI to help organizations quickly identify contractual risks, improve compliance, and accelerate decision-making.

The platform provides an intuitive dashboard for uploading contracts, performing AI-driven analysis, reviewing risk insights, and exporting detailed reports.

---

## Key Features

- Contract Upload (PDF/DOCX)
- AI-Powered Text Extraction
- Clause Parsing & Identification
- Clause Deviation Detection
- Enterprise Risk Assessment
- Executive Summary Generation
- AI Recommendations
- Excel Report Generation
- Interactive Dashboard
- Cloud Deployment

---

## Technology Stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### AI Technologies
- IBM watsonx Orchestrate
- IBM Granite
- IBM Bob (AI-assisted development)

### Deployment
- Vercel
- Render
- GitHub

---

## System Architecture

```
Enterprise User
        │
        ▼
React + Vite Frontend
        │
        ▼
Node.js + Express Backend
        │
        ▼
IBM watsonx Orchestrate
        │
        ▼
IBM Granite
        │
        ▼
Contract Intelligence Engine
        │
 ┌──────┴─────────┐
 ▼                ▼
MongoDB Atlas   Excel Report Generator
        │
        ▼
Analysis Dashboard
```

---

## AI Capabilities

The platform utilizes **IBM watsonx Orchestrate** to coordinate the complete contract intelligence workflow while **IBM Granite** powers intelligent document understanding.

AI performs:

- Contract Understanding
- Clause Extraction
- Clause Comparison
- Deviation Detection
- Risk Assessment
- Executive Summary Generation
- Recommendation Generation

---

## Project Workflow

```
Upload Contract
        │
        ▼
Extract Contract Text
        │
        ▼
Parse Clauses
        │
        ▼
IBM AI Analysis
        │
        ▼
Deviation Detection
        │
        ▼
Risk Assessment
        │
        ▼
Generate Recommendations
        │
        ▼
Generate Excel Report
        │
        ▼
Download Report
```

---

## Enterprise Reports

The platform automatically generates a professional Excel workbook containing:

- Executive Summary
- Clause Deviations
- Risk Assessment
- Recommendations

---

## IBM Technologies Used

- IBM watsonx Orchestrate
- IBM Granite Foundation Models
- IBM Bob
- IBM SkillsBuild

---

## Cloud Deployment

Frontend:
- Vercel

Backend:
- Render

Database:
- MongoDB Atlas

---

## Repository Structure

```
ContractIQ-Sentinel
│
├── client/
├── server/
├── README.md
├── app.json
├── Problem_Statement.pdf
├── ContractIQ_Sentinel_Presentation.pptx
├── render.yaml
├── vercel.json
└── LICENSE
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/<your-username>/ContractIQ-Sentinel.git
```

Install dependencies

```bash
npm install
```

Start Backend

```bash
npm run server
```

Start Frontend

```bash
npm run dev
```

---

## Future Scope

- OCR-based document extraction
- PDF Intelligence
- Fine-tuned Granite models
- AI Legal Copilot
- Multi-language contract support
- Real-time compliance monitoring
- Digital Signature Integration
- Role-based enterprise access

---

## Project Status

Completed as part of the **AICTE IBM SkillsBuild Internship Program**.

---

## Author

**Sabina Khan**

B.Tech Computer Science & Engineering

SOA University

---

## License

This project is licensed under the MIT License.


