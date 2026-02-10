# Deployment Guide

## **Vercel Frontend Deployment**

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add the following:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url/api
   ```
   Replace `https://your-backend-url/api` with your actual backend URL

### Example:
- **Local Dev**: `http://localhost:5000/api`
- **Production**: `https://api.yourbackend.com/api` (or wherever your backend is deployed)

---

## **Backend Deployment (Node.js Server)**

### Step 1: Update Backend Environment

Edit `backend/.env`:
```env
CLIENT_URL=https://student-portal-pearl-tau.vercel.app
NODE_ENV=production
```

### Step 2: Deploy Options

#### Option A: Render.com (Free Tier Available)
1. Push code to GitHub
2. Connect to Render → Create Web Service
3. Set `npm run start` as build command
4. Add environment variables
5. Get your deployed URL

#### Option B: Railway.app
1. Connect GitHub
2. Select Node.js environment
3. Add `.env` variables
4. Deploy

#### Option C: Heroku (Free tier deprecated, but still available)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

---

## **Quick Fix for Current Issue**

### For Vercel Frontend:
1. Go to Vercel Dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add: `NEXT_PUBLIC_BACKEND_URL=https://your-backend-url/api`
5. Redeploy

### For Backend (if still on localhost):
**Option 1: Keep backend on localhost (for testing)**
- On your local machine, update `.env`:
  ```env
  CLIENT_URL=http://localhost:3000,https://student-portal-pearl-tau.vercel.app
  ```

**Option 2: Deploy backend to production**
- Use Render, Railway, or similar
- Update Vercel with the production backend URL

---

## **CORS Error Explained**

The error you saw:
```
CORS policy: Response to preflight request doesn't pass access control check
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000' 
that is not equal to the supplied origin 'https://student-portal-pearl-tau.vercel.app'
```

**Why it happens:**
- Frontend on Vercel (`https://student-portal-pearl-tau.vercel.app`)
- Backend expecting localhost (`http://localhost:3000`)
- They don't match → CORS blocks the request

**How it's fixed:**
- Backend now accepts multiple origins
- Frontend uses environment variable for API URL
- Vercel can inject the correct backend URL at runtime

---

## **Testing After Deployment**

1. Deploy frontend to Vercel with environment variable
2. Set backend URL to your deployed backend
3. Test login:
   - Check browser DevTools → Network tab
   - Should see successful POST to `/api/auth/login`
   - Should see 200 status (not 404 or CORS error)

---

## **Still Getting "Invalid Credentials"?**

1. ✅ Check CORS error is fixed (Network tab)
2. ✅ Check backend is running
3. ✅ Check MongoDB connection
4. ✅ Verify credentials are correct
5. ✅ Check `JWT_SECRET` is same in backend

