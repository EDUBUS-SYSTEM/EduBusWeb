# Frontend-Backend Deployment Configuration Guide

## Overview

This guide explains how to configure the EduBus web frontend to connect to the deployed backend on Azure.

**Azure Backend URL:** `https://edubus-g3bzhegtegfpcgds.southeastasia-01.azurewebsites.net`

## Changes Made

### 1. Frontend Configuration Files

#### `.gitignore` Update
- Added `!.env.example` to allow example environment file in git
- All other `.env*` files remain gitignored (secure)

#### `.env.example` (New)
- Documents all required environment variable
- Safe to commit to git (no secrets)
- Serves as template for developers

### 2. Environment Variables

The frontend uses these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://edubus-g3bzhegtegfpcgds.southeastasia-01.azurewebsites.net/api` |
| `NEXT_PUBLIC_VIETMAP_API_KEY` | VietMap service API key | `your_key_here` |

## Setup Instructions

### For Local Development (Connect to Azure Backend)

1. **Create `.env.local` file** in `frontend/EduBusWeb/`:
   ```bash
   # Copy from example
   cp .env.example .env.local
   ```

2. **Update `.env.local`** with Azure backend:
   ```env
   NEXT_PUBLIC_API_URL=https://edubus-g3bzhegtegfpcgds.southeastasia-01.azurewebsites.net/api
   NEXT_PUBLIC_VIETMAP_API_KEY=your_actual_vietmap_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test the connection:**
   - Open http://localhost:3000
   - Try logging in
   - Check browser console for any errors

### For Production Deployment (Vercel/Netlify/Other)

You need to set environment variables in your deployment platform's dashboard:

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_API_URL` = `https://edubus-g3bzhegtegfpcgds.southeastasia-01.azurewebsites.net/api`
   - `NEXT_PUBLIC_VIETMAP_API_KEY` = `your_actual_key`
3. Redeploy the application

#### Netlify
1. Go to Site Settings → Environment Variables
2. Add the same variables as above
3. Trigger a new deploy

#### Other Platforms
- Follow platform-specific instructions for setting environment variables
- Never commit `.env.local` or `.env.production` to git

## Backend CORS Configuration

### Current Issue
The backend `appsettings.json` CORS settings currently only allow localhost origins:
```json
"CorsSettings": {
  "AllowedOrigins": [
    "http://localhost:3000",
    "http://localhost:3001",
    ...
  ]
}
```

### Required Update

> [!IMPORTANT]
> You need to add your **frontend deployment URL** to the backend CORS allowed origins.

**Steps:**

1. **Determine your frontend URL** (where you deploy the Next.js app)
   - Examples:
     - Vercel: `https://your-app.vercel.app`
     - Netlify: `https://your-app.netlify.app`
     - Custom domain: `https://edubus.yourdomain.com`

2. **Update `backend/EduBusAPIs/APIs/appsettings.json`:**
   ```json
   "CorsSettings": {
     "AllowedOrigins": [
       "http://localhost:3000",
       "http://localhost:3001",
       "https://your-frontend-url.vercel.app",  // Add this
       "https://www.your-frontend-url.vercel.app"  // And this (with www)
     ]
   }
   ```

3. **Deploy backend changes to Azure:**
   - Commit the updated `appsettings.json`
   - Deploy to Azure App Service
   - Restart the Azure app service

## Testing

### 1. Test Local Development
```bash
# In frontend/EduBusWeb
npm run dev
```

Open browser to `http://localhost:3000` and verify:
- ✅ No CORS errors in console
- ✅ API calls succeed
- ✅ Login works
- ✅ Data loads correctly

### 2. Test Production Deployment
After deploying frontend:
- ✅ API calls work from deployed URL
- ✅ No CORS errors
- ✅ All features functional

## Troubleshooting

### CORS Error in Browser Console
**Problem:** `Access to fetch at 'https://edubus-g3bzhegtegfpcgds.southeastasia-01.azurewebsites.net/api/...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Add your frontend URL to backend `appsettings.json` → `CorsSettings:AllowedOrigins`
2. Redeploy backend to Azure
3. Clear browser cache and retry

### API Connection Timeout
**Problem:** Requests timeout or fail

**Solutions:**
1. Verify Azure backend is running: https://edubus-g3bzhegtegfpcgds.southeastasia-01.azurewebsites.net/health/live
2. Check if environment variable is set correctly (inspect in browser console: `process.env.NEXT_PUBLIC_API_URL`)
3. Ensure URL ends with `/api` not just the domain

### Environment Variables Not Working
**Problem:** Changes to `.env.local` not taking effect

**Solutions:**
1. Restart Next.js dev server (`npm run dev`)
2. For Next.js, only `NEXT_PUBLIC_*` variables are exposed to browser
3. Check for typos in variable names

## Security Notes

- ✅ **DO COMMIT:** `.env.example` (no secrets)
- ❌ **DO NOT COMMIT:** `.env.local`, `.env.production`, or any file with actual secrets
- ✅ **CORS origins are safe** to commit (they're not secrets)
- ✅ **API URL is public** (not a secret) - it's the backend endpoint users will call anyway

## Next Steps

1. **Update `.env.local`** with Azure backend URL (done above)
2. **Test locally** to ensure frontend connects to Azure backend
3. **Deploy frontend** to your hosting platform
4. **Update backend CORS** with your frontend deployment URL
5. **Test production** deployment
