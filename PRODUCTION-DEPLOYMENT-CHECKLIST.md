# 🚀 **PRODUCTION DEPLOYMENT CHECKLIST**

## **⚠️ CRITICAL - DO THESE FIRST**

### **1. Database Security (MANDATORY)**
- [ ] **Run SQL script**: Execute `supabase-production-security.sql` in Supabase SQL Editor
- [ ] **Verify RLS**: Test that users can only see their own data
- [ ] **Test authentication**: Ensure Google OAuth works with production domain

### **2. Environment Variables**
- [ ] **Set production URLs**: Update `NEXTAUTH_URL` to your production domain
- [ ] **Generate secure secrets**: New `NEXTAUTH_SECRET` (32+ characters)
- [ ] **Verify all API keys**: FAL, KIE, Google OAuth, Supabase
- [ ] **Test environment validation**: Run validation in production

### **3. Rate Limiting Setup**
- [ ] **Verify rate limits**: Test image/video generation limits
- [ ] **Monitor API usage**: Check FAL/KIE dashboards for spending alerts
- [ ] **Set spending limits**: Add billing alerts in AI provider dashboards

## **💰 COST PROTECTION**

### **API Spending Limits**
- [ ] **FAL AI**: Set monthly spending limit ($100/month recommended)
- [ ] **KIE AI**: Set monthly spending limit ($200/month recommended)
- [ ] **Supabase**: Monitor storage/bandwidth usage

### **Usage Monitoring**
- [ ] **Daily limits enforced**: 10 images, 3 videos, 2 avatars per user/day
- [ ] **Rate limiting active**: 10 images/hour, 3 videos/hour per user
- [ ] **User feedback**: Clear error messages when limits reached

## **🔧 DEPLOYMENT STEPS**

### **1. Pre-deployment Testing**
```bash
# Test environment validation
npm run build
# Verify no errors

# Test API endpoints locally
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","imageUrl":"data:image/png;base64,..."}'
```

### **2. Supabase Setup**
```sql
-- Copy and paste this into Supabase SQL Editor:
-- (Contents of supabase-production-security.sql)
```

### **3. Environment Variables (Production)**
```env
# Authentication
NEXTAUTH_SECRET=your-super-secure-32-char-secret
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI APIs
FAL_API_KEY=your-fal-api-key
KIE_API_KEY=your-kie-api-key
```

### **4. Deploy Command**
```bash
# For Vercel
vercel --prod

# For Netlify
npm run build && netlify deploy --prod

# For Railway/Render
git push origin main
```

## **🔍 POST-DEPLOYMENT VERIFICATION**

### **Immediate Checks (5 minutes)**
- [ ] **Site loads**: Homepage accessible at production URL
- [ ] **Authentication works**: Can sign in with Google
- [ ] **Database connected**: No console errors about Supabase
- [ ] **Rate limits active**: Test image generation limits

### **Security Verification (15 minutes)**
- [ ] **RLS working**: Create test user, verify data isolation
- [ ] **API authentication**: Unauthenticated requests blocked
- [ ] **HTTPS enforced**: All requests use SSL
- [ ] **No development values**: Check for localhost, test keys

### **Performance Testing (30 minutes)**
- [ ] **Image generation**: Test end-to-end workflow
- [ ] **Video generation**: Verify Veo3 pipeline works
- [ ] **Database queries**: Check conversation loading speed
- [ ] **Rate limiting**: Verify 429 responses for exceeded limits

## **📊 MONITORING SETUP**

### **Error Tracking**
- [ ] **Sentry**: Set up error monitoring (recommended)
- [ ] **Vercel Analytics**: Enable for performance insights
- [ ] **Console errors**: Monitor browser console for issues

### **Cost Monitoring**
- [ ] **AI API alerts**: Daily spending notifications
- [ ] **Supabase usage**: Storage and bandwidth alerts
- [ ] **User activity**: Track generation patterns

## **🚨 EMERGENCY PROCEDURES**

### **If Costs Spike**
1. **Disable AI endpoints**: Comment out API routes temporarily
2. **Check rate limits**: Verify they're working
3. **Review usage logs**: Find source of excessive usage
4. **Contact providers**: Request spending freeze if needed

### **If Security Breach**
1. **Rotate all API keys**: FAL, KIE, Supabase, Google
2. **Check RLS policies**: Verify user data isolation
3. **Review audit logs**: Supabase dashboard > Logs
4. **Update NEXTAUTH_SECRET**: Force all users to re-login

### **If Site Down**
1. **Check status pages**: Vercel, Supabase, Google OAuth
2. **Review error logs**: Platform-specific dashboards
3. **Verify environment**: All required variables present
4. **Rollback option**: Previous deployment if needed

## **📈 SUCCESS METRICS**

### **Week 1 Goals**
- [ ] **Users**: 10+ successful signups
- [ ] **Generations**: 50+ images, 10+ videos created
- [ ] **Uptime**: 99%+ availability
- [ ] **Costs**: Under $50 total

### **Month 1 Goals**
- [ ] **Users**: 100+ active users
- [ ] **Performance**: <3s average response time
- [ ] **Costs**: Predictable and under budget
- [ ] **Feedback**: No critical security issues reported

---

## **✅ READY TO DEPLOY?**

**Only proceed if ALL critical items are checked:**
- [x] Database security enabled (RLS)
- [x] Rate limiting implemented
- [x] Usage limits enforced
- [x] Environment variables secured
- [x] Spending limits set

**🚀 Your app is ready for production!**