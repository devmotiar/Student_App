# Firebase API Key Error - Complete Solution

## Problem
You're seeing: **"auth/api-key-not-valid.-Please-pass-a-valid-api-key."**

## Root Cause
Your `.env.local` file has an incomplete or placeholder Firebase API key instead of your real credentials.

## Solution - Choose Your Path

### Path 1: Quick Fix (2 minutes) ⚡
**Best for:** Just want it working ASAP

👉 Read: **FIX_API_KEY_NOW.md**
- 3 simple steps
- Get your API key
- Update .env.local
- Restart server

---

### Path 2: Step-by-Step Setup (15 minutes) 📚
**Best for:** First time Firebase setup, visual learner

👉 Read: **SETUP_FIREBASE_STEP_BY_STEP.md**
- Visual guide with all details
- Create Firebase project
- Register web app
- Enable authentication
- Create Firestore database
- Complete all configuration

---

### Path 3: Complete Reference (30 minutes) 📖
**Best for:** Comprehensive understanding, troubleshooting

👉 Read: **FIREBASE_FIX_GUIDE.md**
- In-depth setup explanation
- All environment variables explained
- Common issues & solutions
- Production deployment guide
- Security rules setup

---

### Path 4: Automated Verification ✔️
**Best for:** Checking if your setup is correct

```bash
# Run verification script
pnpm verify
```

This checks all 6 Firebase variables and tells you exactly what's wrong.

---

## TL;DR - The Fastest Fix

1. Get your real API key:
   - Open: https://console.firebase.google.com
   - Select project → gear icon → Project Settings
   - Copy full apiKey value

2. Update `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Restart:
   ```bash
   pnpm dev
   ```

4. Test at: http://localhost:3000

---

## Files Created to Help

| File | Purpose | Time |
|------|---------|------|
| **FIX_API_KEY_NOW.md** | Quick 3-step fix | 2 min |
| **SETUP_FIREBASE_STEP_BY_STEP.md** | Complete visual guide | 15 min |
| **FIREBASE_FIX_GUIDE.md** | Comprehensive reference | 30 min |
| **API_KEY_FIX_SUMMARY.txt** | Quick reference card | 1 min |
| **scripts/verify-firebase.mjs** | Automated verification | instant |

---

## Verification Checklist

After updating .env.local, run:

```bash
pnpm verify
```

You should see all ✅:
```
✅ NEXT_PUBLIC_FIREBASE_API_KEY - VALID
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN - VALID
✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID - VALID
✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET - VALID
✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID - VALID
✅ NEXT_PUBLIC_FIREBASE_APP_ID - VALID
```

If you see ❌ on any, that variable needs updating.

---

## Common Mistakes

```
❌ WRONG:  NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
✅ RIGHT:  NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

❌ WRONG:  Incomplete or placeholder key
✅ RIGHT:  Full API key from Firebase Console

❌ WRONG:  Forgot to restart dev server
✅ RIGHT:  Run pnpm dev after updating .env.local

❌ WRONG:  Added extra spaces or characters
✅ RIGHT:  Exact copy-paste from Firebase Console
```

---

## Troubleshooting

### Still getting error after following guide?

1. **Run verification:**
   ```bash
   pnpm verify
   ```

2. **Check your API key:**
   ```bash
   cat .env.local | grep API_KEY
   ```
   - Should show full key (40+ characters)
   - Should start with "AIza"
   - Should have NO "..." 

3. **Did you restart the server?**
   ```bash
   # Stop with Ctrl+C
   pnpm dev
   ```

4. **Check Firefox/Chrome Console** (F12)
   - See exact error message
   - Look for clues about what's wrong

---

## Success Indicators

After fix, you can:
- ✅ Sign up for new account
- ✅ See user created in Firestore
- ✅ View dashboard without errors
- ✅ Watch videos with progress
- ✅ Join live classes
- ✅ Download materials
- ✅ See real-time updates

---

## Getting Help

Choose based on your situation:

| Situation | Read This |
|-----------|-----------|
| "Just tell me what to do" | FIX_API_KEY_NOW.md |
| "I've never used Firebase" | SETUP_FIREBASE_STEP_BY_STEP.md |
| "I need detailed explanations" | FIREBASE_FIX_GUIDE.md |
| "I want to verify my setup" | Run: pnpm verify |
| "I want a quick reference" | API_KEY_FIX_SUMMARY.txt |

---

## Next After Fix

Once Firebase is configured and `pnpm verify` shows all green:

1. Start dev server: `pnpm dev`
2. Open http://localhost:3000
3. Sign up with test account
4. Explore LMS features:
   - Watch courses
   - Join live classes
   - Download materials
   - Track progress

---

**Your LMS is fully built and ready to use once Firebase is configured!** 🚀

Start with: **FIX_API_KEY_NOW.md**
