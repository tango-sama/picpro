# ✅ Vercel Deployment Checklist

Use this checklist to ensure a successful deployment:

## Pre-Deployment

- [ ] Vercel CLI installed (`npm install -g vercel` ✓ - Already done!)
- [ ] Build works locally (`npm run build` ✓ - Already tested!)
- [ ] All files committed to git (optional but recommended)
- [ ] `.env` file available for reference

## Initial Deployment

- [ ] Login to Vercel (`vercel login`)
- [ ] Run first deployment (`vercel`)
- [ ] Note your Vercel URL (e.g., `your-app.vercel.app`)

## Environment Configuration

### Add to Vercel Dashboard (Settings → Environment Variables):

- [ ] `VITE_FIREBASE_API_KEY` = `[Your Firebase API Key]`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `[Your Firebase Auth Domain]`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `[Your Firebase Project ID]`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `[Your Firebase Storage Bucket]`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `[Your Firebase Messaging Sender ID]`
- [ ] `VITE_FIREBASE_APP_ID` = `[Your Firebase App ID]`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` = `[Your Firebase Measurement ID]`
- [ ] `VITE_GOOGLE_CLIENT_ID` = `[Your Google OAuth Client ID]`
- [ ] `VITE_GOOGLE_CLIENT_SECRET` = `[Your Google OAuth Client Secret]`
- [ ] `VITE_GOOGLE_REDIRECT_URI` = `https://[YOUR-VERCEL-URL]/auth/google/callback` ⚠️ UPDATE THIS!
- [ ] `VITE_COMFY_DEPLOY_API_KEY` = `[Your ComfyDeploy API Key]`

## OAuth Configuration

### Google Cloud Console (https://console.cloud.google.com/):

- [ ] Navigate to **APIs & Services** → **Credentials**
- [ ] Select your OAuth 2.0 Client ID
- [ ] Add to **Authorized JavaScript origins**:
  - [ ] `https://[your-vercel-url].vercel.app`
- [ ] Add to **Authorized redirect URIs**:
  - [ ] `https://[your-vercel-url].vercel.app/auth/google/callback`
- [ ] Click **Save**

### Firebase Console (https://console.firebase.google.com/):

- [ ] Select project: `pic-pro-base`
- [ ] Go to **Authentication** → **Settings** → **Authorized domains**
- [ ] Add domain: `[your-vercel-url].vercel.app`
- [ ] Click **Save**

## Final Deployment

- [ ] Run production deployment (`vercel --prod`)
- [ ] Wait for deployment to complete
- [ ] Get production URL

## Testing

- [ ] Visit your live site
- [ ] Test Google Login
- [ ] Test user registration
- [ ] Test background changer feature
- [ ] Check user dashboard
- [ ] Verify credits system works
- [ ] Test on mobile device

## Optional: Custom Domain

- [ ] Add custom domain in Vercel dashboard (Settings → Domains)
- [ ] Update DNS settings as instructed
- [ ] Update OAuth URIs with custom domain
- [ ] Update Firebase authorized domains
- [ ] Update `VITE_GOOGLE_REDIRECT_URI` environment variable
- [ ] Redeploy

## Post-Deployment Monitoring

- [ ] Check Vercel deployment logs
- [ ] Monitor Firebase usage
- [ ] Check for errors in browser console
- [ ] Review Firestore security rules

---

## Quick Commands

```bash
# Build locally
npm run build

# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# View deployments
vercel ls
```

## Support

- 📖 Full guide: `VERCEL_DEPLOYMENT.md`
- 🚀 Quick start: `QUICK_DEPLOY.md`
- 🔧 Workflow: `/deploy-vercel`

---

**Note**: After checking each box, you can mark it complete in this file by changing `[ ]` to `[x]`.
