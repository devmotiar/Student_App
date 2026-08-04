# LMS Quick Reference Guide

## 🚀 Get Started in 5 Minutes

### 1. Configure Firebase
```bash
# Copy your Firebase credentials to .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
# ... other variables
```

### 2. Seed Data
```bash
pnpm seed
```

### 3. Start Dev Server
```bash
pnpm dev
```

### 4. Test It
- Open http://localhost:3000
- Sign up or use demo@example.com / demo123456

---

## 📚 Key Features at a Glance

| Feature | Path | What It Does |
|---------|------|-------------|
| Dashboard | `/dashboard` | Overview of learning stats |
| Courses | `/courses` | Browse & enroll in courses |
| Live Classes | `/live-classes` | Join interactive sessions |
| Videos | `/recorded-videos` | Watch on-demand videos |
| Materials | `/materials` | Download study resources |
| Progress | `/progress` | Track learning statistics |

---

## 🔧 Common Tasks

### Add a New User
Users sign up via `/signup` page - automatic Firestore record creation

### Enroll in Course
Click course card → "Enroll in Course" → automatic progress tracking starts

### Watch Video
1. Click course
2. Click lesson  
3. Video player loads with full controls
4. Progress auto-tracked at 90%+ watched

### Join Live Class
Click "Join class" → Live viewer opens with chat

### Download Material
Go to Materials → Click "Download" → Auto-tracked

### Check Progress
Go to Progress page → See stats, achievements, recommendations

---

## 📁 Important Files

```
Authentication:
  lib/firebase-auth-operations.ts    - Auth functions
  lib/hooks/useAuth.ts               - Auth context
  app/(auth)/login/page.tsx          - Login page
  app/(auth)/signup/page.tsx         - Sign-up page

Video & Courses:
  components/video-player.tsx        - Video player
  app/(app)/courses/[id]/page.tsx    - Course detail
  app/(app)/courses/[id]/lesson/[lessonId]/page.tsx - Lesson

Live Classes:
  components/live-class-viewer.tsx   - Live viewer
  app/(app)/live-classes/[id]/page.tsx - Class detail

Progress:
  lib/firebase-progress-operations.ts - Progress tracking
  app/(app)/progress/page.tsx        - Dashboard

Materials:
  lib/firebase-download-operations.ts - Downloads
  app/(app)/materials/page.tsx       - Materials page
```

---

## 🔌 Firebase Operations

```typescript
// Auth
import { signUpWithEmail, signInWithEmail, signOut } from '@/lib/firebase-auth-operations'

// Progress
import { updateCourseProgress, trackVideoWatch } from '@/lib/firebase-progress-operations'

// Materials
import { getCourseMaterials, trackMaterialDownload } from '@/lib/firebase-download-operations'

// Real-time Data
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { useAuth } from '@/lib/hooks/useAuth'
```

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# In Vercel:
# 1. Select repo
# 2. Add environment variables
# 3. Deploy

# Update Firebase allowed domains
# Firebase Console → Auth → Settings → Authorized domains
```

---

## 🧪 Quick Test Checklist

- [ ] Sign up new account
- [ ] Sign in with credentials
- [ ] View and enroll in course
- [ ] Watch video (check progress bar)
- [ ] Join live class (check chat)
- [ ] Download material
- [ ] Check progress dashboard
- [ ] Mobile responsive

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Videos won't play | Check CORS, verify video URL |
| Real-time not updating | Check Firestore rules, refresh |
| Downloads not working | Verify URL, check CORS |
| Can't sign in | Verify email/password, check Firestore |
| Progress not tracking | Ensure authenticated, check DB |

---

## 📖 Full Documentation

- `FULL_IMPLEMENTATION_GUIDE.md` - Complete setup & features
- `PROJECT_COMPLETION_SUMMARY.md` - Project overview
- `EXAMPLES.md` - Code examples
- `GETTING_STARTED.md` - Detailed setup

---

## 💡 Pro Tips

1. **Firebase Emulator** - Use for local development without internet
2. **Firestore Indexes** - Create indexes for complex queries
3. **Image Optimization** - Use Next.js Image component
4. **Caching** - Use SWR for client-side caching
5. **Analytics** - Add Firebase Analytics for insights

---

## 🔐 Security Checklist

- [ ] Never commit `.env.local`
- [ ] Use production Firestore rules
- [ ] Enable HTTPS only
- [ ] Validate user input
- [ ] Implement rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 🆘 Need Help?

1. Check documentation files
2. Review code comments
3. Check browser console (F12)
4. Check Firebase Console logs
5. See troubleshooting section

---

**Your LMS is ready! Deploy with confidence!** 🎉
