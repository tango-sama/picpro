# Deploying PicPro to Vercel

This guide will walk you through deploying your full-stack PicPro application to Vercel.

## Prerequisites

✅ **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
✅ **Vercel CLI**: Already installed globally
✅ **Environment Variables**: Have your `.env` file ready

## Deployment Steps

### 1. Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate. Choose your preferred method (GitHub, GitLab, Bitbucket, or Email).

### 2. Build the Frontend

Before deploying, ensure your React app builds successfully:

```bash
npm run build
```

This creates the optimized production build in the `dist` folder.

### 3. Deploy to Vercel

#### Option A: Quick Deploy (Recommended for First Time)

```bash
vercel
```

The CLI will ask you:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time)
- **What's your project's name?** → `picpro` (or your preference)
- **In which directory is your code located?** → `./` (press Enter)

Vercel will detect your settings and deploy!

#### Option B: Production Deploy

```bash
vercel --prod
```

Use this for your final production deployment.

### 4. Configure Environment Variables

**CRITICAL**: Your app won't work without environment variables!

#### Via CLI:

```bash
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
vercel env add VITE_GOOGLE_CLIENT_ID production
vercel env add VITE_GOOGLE_CLIENT_SECRET production
vercel env add VITE_GOOGLE_REDIRECT_URI production
vercel env add VITE_COMFY_DEPLOY_API_KEY production
```

After each command, paste the value from your `.env` file.

#### Via Dashboard (Easier):

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `picpro` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_SECRET`
   - `VITE_GOOGLE_REDIRECT_URI` (⚠️ Update this to your Vercel URL!)
   - `VITE_COMFY_DEPLOY_API_KEY`

5. Click **Save**

### 5. Update OAuth Redirect URI

**IMPORTANT**: Update your Google OAuth configuration!

#### Get Your Vercel URL:
After deployment, Vercel will give you URLs like:
- **Preview**: `https://picpro-xyz123.vercel.app` (temporary)
- **Production**: `https://picpro.vercel.app` (or your custom domain)

#### Update Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add these to **Authorized redirect URIs**:
   ```
   https://picpro.vercel.app/auth/google/callback
   https://your-production-url.vercel.app/auth/google/callback
   ```
5. Add these to **Authorized JavaScript origins**:
   ```
   https://picpro.vercel.app
   https://your-production-url.vercel.app
   ```
6. Click **Save**

#### Update Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized Domains**
4. Add your Vercel domain:
   ```
   picpro.vercel.app
   your-production-url.vercel.app
   ```

### 6. Update Environment Variable

Update `VITE_GOOGLE_REDIRECT_URI` in Vercel to your production URL:

```
VITE_GOOGLE_REDIRECT_URI=https://picpro.vercel.app
```

Then redeploy:

```bash
vercel --prod
```

## Post-Deployment

### View Your Live Site

Vercel will provide you with a URL:
```
✅ Production: https://picpro.vercel.app
```

### Monitor Deployments

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. View the **Deployments** tab to see build logs and status

### Set Up Custom Domain (Optional)

1. In your Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `picpro.com`)
3. Update your DNS settings as instructed by Vercel
4. Vercel automatically provisions SSL certificates!

## Troubleshooting

### API Routes Not Working

**Problem**: `/api/*` or `/auth/*` routes return 404

**Solution**: Ensure `vercel.json` is configured correctly (already done). Redeploy:
```bash
vercel --prod
```

### Environment Variables Not Loading

**Problem**: App shows "Missing Firebase config" or similar errors

**Solution**: 
1. Verify all environment variables are set in Vercel dashboard
2. Redeploy after adding variables:
   ```bash
   vercel --prod
   ```

### Google Login Fails

**Problem**: "Redirect URI mismatch" error

**Solution**:
1. Double-check Authorized Redirect URIs in Google Cloud Console
2. Ensure they match EXACTLY (including `https://` and `/auth/google/callback`)
3. Update `VITE_GOOGLE_REDIRECT_URI` in Vercel to match your production URL

### Build Fails

**Problem**: Build errors during deployment

**Solution**:
1. Test locally first: `npm run build`
2. Fix any errors
3. Commit changes and redeploy
4. Check the build logs in Vercel dashboard for specific errors

### Firebase Rules

**Problem**: Users can't access Firestore data

**Solution**: Update Firestore Security Rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Commands Reference

```bash
# Login to Vercel
vercel login

# Build frontend locally
npm run build

# Deploy preview (staging)
vercel

# Deploy production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

## Architecture on Vercel

- **Frontend**: Static files served from `/dist` folder
- **Backend**: Express server runs as Vercel Serverless Functions
- **Routes**: 
  - `/api/*` → Serverless Function (server.js)
  - `/auth/*` → Serverless Function (server.js)
  - `/*` → Static files (React app)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express with Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**✨ Your PicPro app is now ready for the world!** 🚀
