# 🚀 MVP Production Deployment Guide

## ⚡ Quick Deploy (15 minutes total)

### 1. **Deploy to Vercel** (5 minutes)
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Build locally to check for errors
npm run build

# Deploy to production
vercel --prod
```

### 2. **Environment Variables Setup** (5 minutes)
Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables:
```
FAL_API_KEY=your_fal_api_key_from_fal.ai_dashboard
KIE_API_KEY=your_kie_api_key_from_kie.ai
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate_a_random_32char_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### 3. **Google OAuth Setup** (5 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 client
3. Add to **Authorized JavaScript origins**:
   - `https://your-app-name.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `https://your-app-name.vercel.app/api/auth/callback/google`

### 4. **Final Steps**
- Redeploy after adding environment variables: `vercel --prod`
- Test all features: sign in, image upload, image editing, video generation
- Share link with your 3 users! 🎉

## 🔧 Environment Variable Sources

### FAL API Key
- Get from: https://fal.ai/dashboard/keys
- Used for: Image editing & Avatar video generation

### KIE API Key  
- Get from: https://kie.ai/api-key
- Used for: Motion video generation (Veo3)

### Google OAuth
- Get from: https://console.cloud.google.com/apis/credentials
- Create new OAuth 2.0 client if needed

### NextAuth Secret
- Generate random string: `openssl rand -base64 32`
- Or use: https://generate-secret.vercel.app/32

## 🧪 Testing Checklist
- [ ] Sign in with Google works
- [ ] Image upload works
- [ ] Image editing with prompts works  
- [ ] Motion video generation works
- [ ] Avatar video generation works
- [ ] Video library page works
- [ ] Mobile responsive design

## 🎯 MVP Success Metrics
- User can sign in
- User can edit images with AI
- User can generate videos from images
- Beautiful Bauhaus/Nano Banana design works
- All 3 test users can access and use the app

## 🚨 Production Notes
- Avatar generation timeout: 20 minutes (for GPU cold starts)
- Video generation uses 9:16 format
- App uses IndexedDB for client-side storage
- Multi-user authentication with data separation
- Bauhaus color palette with yellow theme (Nano Banana! 🍌)