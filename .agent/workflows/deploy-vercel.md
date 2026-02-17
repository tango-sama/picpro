---
description: Deploy PicPro to Vercel
---

# Deploy to Vercel Workflow

Follow these steps to deploy your PicPro application to Vercel.

## Step 1: Login to Vercel

```bash
vercel login
```

This opens your browser to authenticate with your Vercel account.

## Step 2: Build the Frontend

Build your React application:

```bash
npm run build
```

This ensures your frontend compiles successfully before deployment.

## Step 3: Deploy to Vercel

For your first deployment or preview:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

## Step 4: Configure Environment Variables

You must add all environment variables from your `.env` file to Vercel:

### Via Vercel Dashboard (Recommended):

1. Go to https://vercel.com/dashboard
2. Select your `picpro` project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_SECRET`
   - `VITE_GOOGLE_REDIRECT_URI` (Update to your Vercel URL!)
   - `VITE_COMFY_DEPLOY_API_KEY`

### Via CLI:

```bash
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# ... (repeat for all variables)
```

## Step 5: Update OAuth Credentials

**Critical**: Update your Google OAuth settings with your Vercel URL!

### Google Cloud Console:

1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/auth/google/callback
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```

### Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized Domains**
4. Add: `your-app.vercel.app`

## Step 6: Update Redirect URI Environment Variable

In Vercel dashboard, update:

```
VITE_GOOGLE_REDIRECT_URI=https://your-app.vercel.app
```

## Step 7: Redeploy

After updating environment variables:

```bash
vercel --prod
```

## Done! 🎉

Your app is now live at: `https://your-app.vercel.app`

---

**Troubleshooting**: See `VERCEL_DEPLOYMENT.md` for detailed troubleshooting guide.
