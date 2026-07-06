# ContractIQ Sentinel — Deployment Guide

Complete step-by-step guide to deploying ContractIQ Sentinel to production using
**Render** (backend), **Vercel** (frontend), and **MongoDB Atlas** (database).

---

## Prerequisites

- GitHub account with this repository pushed
- MongoDB Atlas account (free tier works)
- IBM Cloud account with watsonx.ai access
- Vercel account (free tier works)
- Render account (free tier works)

---

## Step 1 — MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create a Free Cluster**
2. Choose **AWS us-east-1** (closest to Render's default region)
3. **Database Access** → Add a new user:
   - Username: `contractiq-user`
   - Password: (generate a strong password — save it)
   - Role: `Read and write to any database`
4. **Network Access** → Add IP Address:
   - Click **Allow Access From Anywhere** (`0.0.0.0/0`) for cloud deployments
5. **Connect** → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://contractiq-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password and append the database name:
   ```
   MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
   ```
   > Save this as `MONGO_URI` — you'll need it in Step 2.

---

## Step 2 — IBM watsonx.ai Setup

1. Log in to [cloud.ibm.com](https://cloud.ibm.com)
2. **API Keys** → [Manage → Access (IAM) → API keys](https://cloud.ibm.com/iam/apikeys) → **Create**
   - Name: `contractiq-sentinel`
   - Copy the key immediately — it will not be shown again
   > Save as `WATSONX_API_KEY`
3. Go to [dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com) (watsonx.ai)
4. Open your project → **Manage** tab → Copy the **Project ID**
   > Save as `WATSONX_PROJECT_ID`
5. Model ID to use: `ibm/granite-13b-instruct-v2`

---

## Step 3 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repository
3. Render will auto-detect the `render.yaml` file and pre-fill settings
4. If configuring manually, use these settings:

   | Field | Value |
   |---|---|
   | **Name** | `contractiq-sentinel-api` |
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Health Check Path** | `/api/health` |
   | **Plan** | Free |

5. **Environment Variables** — Add each one in the Render dashboard:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *(from Step 1)* |
   | `WATSONX_API_KEY` | *(from Step 2)* |
   | `WATSONX_PROJECT_ID` | *(from Step 2)* |
   | `WATSONX_API_URL` | `https://us-south.ml.cloud.ibm.com` |
   | `WATSONX_MODEL_ID` | `ibm/granite-13b-instruct-v2` |
   | `CLIENT_URL` | `https://contractiq-sentinel.vercel.app` |
   | `USE_MOCK_ANALYSIS` | `false` |
   | `PORT` | `5000` |

6. Click **Create Web Service** → Wait for deployment (~3 minutes)
7. Copy your Render service URL:
   ```
   https://contractiq-sentinel-api.onrender.com
   ```

8. **Verify health check:**
   ```
   GET https://contractiq-sentinel-api.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "status": "ok",
       "database": { "state": "connected" },
       "ai": { "status": "configured" }
     }
   }
   ```

> **Free tier note:** Render free web services spin down after 15 minutes of inactivity.
> The first request after a spin-down may take 30–60 seconds to cold start. This is expected behaviour.

---

## Step 4 — Configure Frontend API URL

Before deploying to Vercel, update `client/.env.production` with your actual Render URL:

```bash
# client/.env.production
VITE_API_URL=https://contractiq-sentinel-api.onrender.com/api
```

Commit and push this change:
```bash
git add client/.env.production
git commit -m "chore: set production API URL"
git push origin main
```

---

## Step 5 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Vercel will auto-detect `vercel.json` — verify these settings:

   | Field | Value |
   |---|---|
   | **Framework Preset** | Other (manual via vercel.json) |
   | **Root Directory** | `.` (repository root) |
   | **Build Command** | `cd client && npm install && npm run build` |
   | **Output Directory** | `client/dist` |

4. **Environment Variables** — Add in Vercel dashboard:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://contractiq-sentinel-api.onrender.com/api` |

5. Click **Deploy** → Wait for build (~2 minutes)
6. Your app is live at: `https://contractiq-sentinel.vercel.app`

---

## Step 6 — Update Backend CORS

If Vercel assigns a different URL than `contractiq-sentinel.vercel.app`, update
`server/app.js` in the `allowedOrigins` array and redeploy Render:

```js
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://YOUR-ACTUAL-VERCEL-URL.vercel.app',   // ← update this
];
```

Alternatively, set the `CLIENT_URL` environment variable in Render to the exact
Vercel URL — no code change required.

---

## Step 7 — GitHub Actions CI/CD

The CI pipeline at `.github/workflows/ci.yml` runs automatically on every push to
`main` or `develop` and on all pull requests.

**What it checks:**
- Frontend: `npm ci` → lint → `npm run build` → verifies `dist/index.html` exists
- Backend: `npm ci` → syntax check all `.js` files in services/controllers/routes/middleware

**To set the CI badge URL in README.md:**
Replace `YOUR_ORG/contractiq-sentinel` with your actual GitHub `username/repo-name`.

---

## Step 8 — Seed Production Database (Optional)

To populate the production database with sample data for demos:

```bash
cd server
MONGO_URI="mongodb+srv://..." NODE_ENV=production node seed.js
```

> **Warning:** The seed script clears existing data before inserting.
> Do NOT run this on a database with real contract data.

---

## Post-Deployment Verification Checklist

Run through these checks after every deployment:

- [ ] `GET /api/health` returns `"status": "ok"` with `"database.state": "connected"`
- [ ] `GET /api/health` shows `"ai.status": "configured"` (watsonx API key is set)
- [ ] Frontend loads at the Vercel URL without console errors
- [ ] SPA routing works: navigate to `/analysis`, refresh — still shows the correct page
- [ ] Contract upload accepts a PDF and shows a success message
- [ ] Analysis page triggers AI analysis and returns results
- [ ] Excel export downloads a `.xlsx` file with 4 sheets
- [ ] Dark mode toggle works and persists on refresh

---

## Troubleshooting

### Backend won't connect to MongoDB
- Check that `0.0.0.0/0` is in MongoDB Atlas Network Access
- Verify the connection string has the database name (`/contractiq?`)
- Check Render logs: Dashboard → Your Service → **Logs**

### AI analysis returns mock data unexpectedly
- Verify `USE_MOCK_ANALYSIS=false` in Render environment variables
- Check `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` are set correctly
- Check Render logs for `IAM token` or `Granite` error messages

### Frontend shows CORS errors
- Verify `CLIENT_URL` in Render matches the exact Vercel URL (no trailing slash)
- Check that `server/app.js` `allowedOrigins` includes your Vercel URL
- Redeploy Render after changing environment variables

### Excel download fails
- Check `server/reports/` directory exists on Render (created automatically)
- Verify `exceljs` is in `server/package.json` dependencies (not devDependencies)
- Check Render logs for ExcelJS errors

### Vercel build fails
- Verify `client/.env.production` is committed to the repository
- Check that `VITE_API_URL` is set correctly in Vercel environment variables
- Check the Vercel deployment logs for specific build errors

---

## Cost Estimate (Free Tier)

| Service | Free Tier Limits |
|---|---|
| **Vercel** | 100 GB bandwidth/month, unlimited deployments |
| **Render** | 750 hours/month (1 free web service), spins down after 15 min idle |
| **MongoDB Atlas** | 512 MB storage, shared cluster |
| **IBM Cloud** | Lite plan includes watsonx.ai API credits |

> All services used in this project have generous free tiers suitable for demos and internship projects.

---

*For architecture details, see [server/ARCHITECTURE.md](server/ARCHITECTURE.md)*
