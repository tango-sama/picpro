# Quick Deploy to Vercel 🚀

## One-Time Setup

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy (First Time)**
   ```bash
   npm run build
   vercel
   ```
   
   Answer the questions:
   - Set up and deploy? **Yes**
   - Project name? **picpro**
   - Directory? **./** (press Enter)

3. **Add Environment Variables**
   
   Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
   
   Copy ALL variables from your `.env` file, but **UPDATE**:
   ```
   VITE_GOOGLE_REDIRECT_URI=https://your-app.vercel.app
   ```

4. **Update Google OAuth**
   
   - **Google Cloud Console**: Add `https://your-app.vercel.app/auth/google/callback` to Authorized Redirect URIs
   - **Firebase Console**: Add `your-app.vercel.app` to Authorized Domains

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Future Updates

Just run:
```bash
npm run build
vercel --prod
```

---

📖 **Full Guide**: See `VERCEL_DEPLOYMENT.md` for detailed instructions
🔧 **Workflow**: Use `/deploy-vercel` command for step-by-step guidance
