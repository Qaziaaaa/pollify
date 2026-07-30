# 🚀 OpinionHub — Deployment Guide

## Architecture

```
Vercel (frontend) ──► Render (backend) ──► MongoDB Atlas
  React + Vite           Express API           Cloud DB
```

---

## Prerequisites

| Item | Why |
|---|---|
| **GitHub account** | Both Vercel and Render deploy directly from repos |
| **MongoDB Atlas cluster** | Free tier (M0) is enough — [atlas.mongodb.com](https://atlas.mongodb.com) |
| **Cloudinary account** | Free tier — handles user avatars + poll images |
| **Brevo SMTP account** | Free tier (300 emails/day) — sends OTP/verification emails |

---

## 1. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create Cluster** (M0 free tier)
2. Wait ~3 minutes for provisioning
3. Under **Database Access** → **Add New User**:
   - Username: `opinionhub` (or anything)
   - Password: generate a strong one → **copy it now**
   - Built-in Role: `Read and Write to any database`
4. Under **Network Access** → **Add IP Address**:
   - Switch to **Allow Access from Anywhere** (`0.0.0.0/0`) — needed so Render can connect
5. Under **Databases** → **Connect** → **Drivers**:
   - Copy the connection string (starts with `mongodb+srv://...`)

**Save this**: `MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/opinionhub?retryWrites=true&w=majority`

---

## 2. Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign up** (free)
2. From the Dashboard, copy:
   - `CLOUDINARY_CLOUD_NAME` — looks like `dczpwjplu`
   - `CLOUDINARY_API_KEY` — a number
   - `CLOUDINARY_API_SECRET` — a long string

---

## 3. Brevo (SMTP) Setup

1. Go to [brevo.com](https://brevo.com) → **Sign up** (free)
2. Navigate to **Transactionnel Emails** → **SMTP & API**
3. Copy:
   - `SMTP_HOST=smtp-relay.brevo.com`
   - `SMTP_PORT=587`
   - `SMTP_USER` — the SMTP login email they give you
   - `SMTP_PASS` — your SMTP master key
4. Set `EMAIL_FROM` to your own email address

---

## 4. Backend — Deploy on Render

### Step 4.1: Push to GitHub

```bash
# Make sure everything is committed
git add .
git commit -m "chore: prepare for deployment"

# Push to GitHub (create a repo first if you haven't)
git remote add origin https://github.com/<your-username>/opinionhub.git
git push -u origin frontend
```

### Step 4.2: Create Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Fill in the details:

| Field | Value |
|---|---|
| **Name** | `opinionhub-api` |
| **Region** | Choose the closest to your users |
| **Branch** | `frontend` (or `main`) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

### Step 4.3: Environment Variables

Click **Advanced** and add these one by one:

| Variable | Value | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://...` | From MongoDB Atlas step |
| `JWT_SECRET` | `a-long-random-string-here` | Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRE` | `7d` | Token lifetime |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard | |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard | |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard | |
| `SMTP_HOST` | `smtp-relay.brevo.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | from Brevo | |
| `SMTP_PASS` | from Brevo | |
| `EMAIL_FROM` | your email | Where OTP emails come from |
| `CORS_ORIGIN` | `https://opinionhub.vercel.app` | Your frontend URL (set after Vercel deploys) |
| `NODE_VERSION` | `22.x` | Pin Node version |

> ⚠️ **Important**: After Vercel deploys, come back and update `CORS_ORIGIN` to your actual Vercel domain.

### Step 4.4: Deploy

1. Click **Create Web Service**
2. Wait ~5 minutes for the first build
3. You'll get a URL like `https://opinionhub-api.onrender.com`
4. Verify: visit `https://opinionhub-api.onrender.com/` → should say `"OpinionHub API is running"`
5. Verify: visit `https://opinionhub-api.onrender.com/api/polls/stats` → should return JSON

> 🛑 **Note on Free Tier**: Render's free tier spins down after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up. This is normal.

---

## 5. Frontend — Deploy on Vercel

### Step 5.1: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repo
4. Fill in the details:

| Field | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `dist` (auto-detected) |

### Step 5.2: Environment Variable

Add this in the **Environment Variables** section:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://opinionhub-api.onrender.com/api` |

Replace the URL with your actual Render backend URL.

### Step 5.3: Deploy

1. Click **Deploy**
2. Wait ~2 minutes
3. You'll get a URL like `https://opinionhub.vercel.app`

### Step 5.4: Update CORS on Render

Go back to **Render Dashboard** → **Environment** → update `CORS_ORIGIN` to `https://opinionhub.vercel.app`

---

## 6. Post-Deployment Checklist

| Check | How |
|---|---|
| ✅ **App loads** | Visit your Vercel URL |
| ✅ **Login works** | Try logging in with an existing account |
| ✅ **Register works** | Create a new account (check email for OTP) |
| ✅ **Create poll** | Create a Yes/No and a Single-choice poll |
| ✅ **Vote** | Vote on a poll — check for animation flash |
| ✅ **Comments** | Add a comment, delete it |
| ✅ **Bookmark** | Bookmark a poll, check Bookmarked page |
| ✅ **Images** | Upload an image poll |
| ✅ **Edit poll** | Edit your poll's question and category |
| ✅ **Delete poll** | Verify dark-themed ConfirmModal shows |
| ✅ **Dark theme** | All popups/dropdowns match the theme |
| ✅ **Responsive** | Test on mobile viewport |

---

## 7. Troubleshooting

### "Cannot connect to MongoDB" on Render
- Check your `MONGO_URI` in environment variables
- Verify Network Access in MongoDB Atlas allows `0.0.0.0/0`
- Make sure the username/password has no special chars URL-encoded (use `%40` for `@`, `%23` for `#`, etc.)

### "CORS error" in browser
- Confirm `CORS_ORIGIN` on Render exactly matches your Vercel domain (no trailing slash)
- Both `https://opinionhub.vercel.app` and `https://www.opinionhub.vercel.app` need coverage if you use both

### "Failed to load polls" on frontend
- Check `VITE_API_URL` on Vercel is set correctly
- The Render URL must end with `/api` — e.g., `https://opinionhub-api.onrender.com/api`

### SMTP emails not sending
- In Brevo, go to **Sender Identity** and verify your sender email
- Check that Brevo SMTP keys are active (not expired)
- Free Brevo may throttle — check your Transactional Email quota

### Free tier cold start (slow first load)
- Render free instances spin down after 15min idle
- Use [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) to ping your backend every 14 minutes
- Or import `express` and add a `GET /ping` endpoint that a free cron job hits

---

## 8. Custom Domain (Optional)

### Vercel
1. Go to your project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions

### Render
1. Go to your Web Service → **Settings** → **Custom Domain**
2. Add your domain and configure the CNAME record

---

## 9. Files & Config Summary

```
.
├── backend/
│   ├── server.js              # Entry point (Render starts here)
│   ├── Procfile               # Render: web: node server.js
│   ├── .node-version          # Pins Node to 22.x
│   └── package.json           # start: "node server.js"
├── frontend/
│   ├── vercel.json            # SPA rewrites + cache headers
│   ├── .node-version          # Pins Node to 22.x
│   ├── vite.config.js         # React + Tailwind plugins
│   └── package.json           # build: "vite build"
├── .gitignore                 # Ignores node_modules, .env, build outputs
└── DEPLOYMENT.md              # This file
```

---

## 10. Quick-Start (Environment Variables Cheatsheet)

```env
# === Backend (Render) ===
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/opinionhub?retryWrites=true&w=majority
JWT_SECRET=<random-64-char-hex>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_user
SMTP_PASS=your_brevo_smtp_pass
EMAIL_FROM=your@email.com
CORS_ORIGIN=https://opinionhub.vercel.app

# === Frontend (Vercel) ===
VITE_API_URL=https://opinionhub-api.onrender.com/api
```
