# 🔴 Firebase API Key Error - Quick Fix

You're getting: **"auth/api-key-not-valid.-Please-pass-a-valid-api-key."**

This means your Firebase API key is missing or incomplete.

---

## 3-Step Quick Fix (2 minutes)

### Step 1: Get Your Real API Key
1. Open: https://console.firebase.google.com
2. Click your project (e.g., "student-lms")
3. Click gear icon ⚙️ → "Project Settings"
4. Find your Firebase config on this page
5. Copy the full `apiKey` value (looks like: `AIzaSyDxxxxx...`)

### Step 2: Update .env.local
In your project, open `.env.local` and update:

```bash
# Find this line:
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...

# Replace with your FULL key (copy from Firebase Console):
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important:**
- Copy the ENTIRE key (not just `AIza...`)
- No spaces before or after
- No dots remaining
- Must start with `AIza`

### Step 3: Restart Dev Server
```bash
# Stop the running server (Ctrl+C)
pnpm dev
```

---

## Verify It Works

```bash
# Run verification script
pnpm verify
```

You should see:
```
✅ All Firebase credentials are valid!
```

---

## Still Getting Error?

### Check 1: Is .env.local in the right place?
```bash
ls -la .env.local
# Should show file exists in project root
```

### Check 2: Is API key complete?
```bash
cat .env.local | grep FIREBASE_API_KEY
# Should show full key, not "AIza..."
```

### Check 3: Did you restart the server?
```bash
# Stop with Ctrl+C, then:
pnpm dev
```

---

## Complete Setup Guide

If you haven't set up Firebase yet, see:
- `SETUP_FIREBASE_STEP_BY_STEP.md` - Visual step-by-step guide
- `FIREBASE_FIX_GUIDE.md` - Comprehensive troubleshooting

---

## Files Created to Help

1. **FIREBASE_FIX_GUIDE.md** - Complete Firebase setup
2. **SETUP_FIREBASE_STEP_BY_STEP.md** - Visual guide
3. **scripts/verify-firebase.mjs** - Verification script
4. **pnpm verify** - Command to check your setup

---

**That's it! Your API key error should be fixed.** ✅

After fixing:
1. Open http://localhost:3000
2. Sign up with an account
3. Start using the LMS!
