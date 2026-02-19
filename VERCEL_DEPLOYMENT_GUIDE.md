# Vercel Deployment Checklist

## Issue
When local backend server is running, Vercel deployment works. When local server is offline, deployment fails. This is because the frontend wasn't configured with the production backend URL.

## Solution: Step-by-Step Deployment

### 1. Deploy Your Backend First
- Deploy backend to: **Railway**, **Render**, **Heroku**, or your own server
- Get the backend URL (e.g., `https://api.example.com`)
- Update CORS in backend `.env`:
  ```
  CLIENT_URL=https://your-vercel-frontend-url.vercel.app
  ```

### 2. Configure Frontend Environment Variables
Set these in **Vercel Dashboard** → Project Settings → Environment Variables:

| Variable Name | Value | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Your backend URL with `/api` path | `https://api.example.com/api` |

### 3. Deploy Frontend to Vercel
```bash
# Option A: Deploy from Vercel Dashboard (Recommended)
# - Connect your GitHub repo
# - Set environment variables in project settings
# - Deploy

# Option B: Deploy via CLI
npm install -g vercel
vercel
# Follow prompts and set environment variables when asked
```

### 4. Verify Deployment
- Visit your Vercel URL
- Try login, signup, or any API call
- Check browser console for errors
- If API calls still fail, verify:
  - Backend is running and accessible
  - `NEXT_PUBLIC_API_URL` is correctly set in Vercel
  - Backend CORS allows your Vercel domain
  - Backend `CLIENT_URL` includes your Vercel domain

### 5. Backend CORS Configuration
Ensure your backend `server.js` or `config/db.js` allows Vercel domain:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:3000",           // Local dev
    "https://your-app.vercel.app"      // Vercel production
  ],
  credentials: true,
};
app.use(cors(corsOptions));
```

## Common Issues & Fixes

### ❌ Issue: API calls return 404 or fail in production
**Cause:** `NEXT_PUBLIC_API_URL` not set in Vercel
**Fix:** 
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL=https://your-backend-url/api`
3. Redeploy or trigger a new build

### ❌ Issue: CORS errors in browser console
**Cause:** Backend doesn't allow Vercel domain
**Fix:** Add Vercel URL to backend `CLIENT_URL`:
```env
CLIENT_URL=http://localhost:3000,https://your-app.vercel.app
```

### ❌ Issue: Variables visible in browser but API still fails
**Cause:** Need to rebuild after adding env vars
**Fix:** 
1. Add environment variable in Vercel Dashboard
2. Go to Deployments → Click latest → Click "Redeploy"

## Testing Variable Configuration
Test if env var is properly set in frontend:
```javascript
// Add this temporarily to a page component
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
```

This should print your backend URL in production, not `undefined`.

## Quick Reference for API Base URLs

### Development
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- API calls go to: `http://localhost:5000/api`

### Production (Vercel)
- Backend: `https://your-deployed-backend.com`
- Frontend: `https://your-app.vercel.app`
- API calls go to: `https://your-deployed-backend.com/api`
