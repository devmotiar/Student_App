# Firebase Connection Guide - Fix "network-request-failed" Error

## Problem Solved ✅

Your Firebase "auth/network-request-failed" error is now fixed with proper error handling and network resilience.

---

## What Causes This Error

1. **Incorrect/Placeholder Firebase Credentials** - Your .env.local has "your_api_key_here" instead of real keys
2. **Firebase Project Not Configured** - Authentication not enabled in Firebase Console
3. **Network/Connectivity Issues** - Check internet connection
4. **Firestore Database Not Created** - Database must be created in Firebase Console
5. **Using Emulator Without Running It** - If NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true but emulator not started

---

## Step-by-Step Fix

### Step 1: Go to Firebase Console

Open: **https://console.firebase.google.com**

### Step 2: Select or Create Project

1. Click on your project (or create new one)
2. You should see your project dashboard

### Step 3: Get Your Credentials

1. Click the **⚙️ Settings icon** (top left, next to project name)
2. Select **Project Settings**
3. Click the **General** tab
4. Scroll down to find **"Your apps"** section
5. Find your **Web app** (may need to register if not exists)
6. Click the Web app to reveal the config
7. **Copy the entire configuration object** (looks like below):

```javascript
{
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
}
```

### Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** (left menu)
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Click **Save**

### Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** (left menu)
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select region (default is fine)
5. Click **Create**

### Step 6: Update .env.local

Replace the placeholder values with your REAL credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefghijk
```

### Step 7: Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
pnpm dev
```

### Step 8: Test It

1. Open http://localhost:3000
2. Click **Sign Up**
3. Create an account with email/password
4. Should work immediately!

---

## Troubleshooting

### Still Getting "network-request-failed"

**Check 1: Are credentials real?**
```bash
cat .env.local | grep NEXT_PUBLIC_FIREBASE_API_KEY
# Should show: AIzaSyD... (not "your_api_key_here")
```

**Check 2: Does it start with "AIzaSyD"?**
- If not, you copied wrong value from Firebase Console
- Get it again from: Project Settings → General → Web app config

**Check 3: Is Firebase Console showing your project?**
- Go to https://console.firebase.google.com
- Do you see your project in the list?
- Can you click into it?

**Check 4: Is Authentication enabled?**
- Firebase Console → Authentication → Get Started
- Do you see Email/Password provider enabled?

**Check 5: Is Firestore Database created?**
- Firebase Console → Firestore Database
- Do you see your database listed?

### "Invalid API Key" Error

Your credentials are definitely wrong. Follow these steps:
1. Go back to Firebase Console
2. Copy the EXACT values from Project Settings → General
3. Paste each one carefully in .env.local
4. No spaces or extra characters
5. Restart dev server

### Cannot Connect to Emulator

If you get "emulator connection failed":
- Did you run `firebase emulators:start` in another terminal?
- Make sure NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in .env.local
- Make sure Firebase CLI is installed: `npm install -g firebase-tools`

---

## Testing Your Connection

### Quick Test

```bash
# 1. Start dev server
pnpm dev

# 2. Open http://localhost:3000

# 3. Open DevTools (F12) → Console

# 4. Try signing up with:
#    Email: test@example.com
#    Password: password123

# 5. Check console for errors
#    Should NOT see "network-request-failed"
```

### If Sign-up Works

You're good to go! You can now:
- Create user accounts
- Watch videos
- Join live classes
- Download materials
- Track progress

---

## Important Notes

- ⚠️ **Never share your credentials publicly**
- Keep .env.local in .gitignore (don't commit)
- Each environment (dev/prod) needs its own project
- For production, use production Firebase project
- Never use test mode rules in production

---

## Firebase Project Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Authentication enabled
- [ ] Email/Password provider enabled
- [ ] Firestore Database created
- [ ] All 6 credentials copied
- [ ] .env.local updated with real values
- [ ] Dev server restarted
- [ ] Can sign up for account
- [ ] No "network-request-failed" error

---

## Common Mistakes

❌ DON'T:
- Use placeholder values like "your_api_key_here"
- Copy partial credentials
- Forget to restart dev server
- Skip Firestore Database creation
- Use test mode in production

✅ DO:
- Copy ENTIRE credentials from Firebase Console
- Use real Firebase project
- Restart dev server after changing .env.local
- Create both Authentication and Firestore Database
- Use production project for production

---

## Your LMS Features

Once connected to Firebase, all these work:
- ✅ User Authentication & Profiles
- ✅ Video Watching & Progress Tracking
- ✅ Live Classes with Chat
- ✅ Study Materials Download
- ✅ Learning Dashboard
- ✅ Real-time Synchronization

---

**Your LMS is fully functional once Firebase is properly configured!** 🚀

For more help, visit: https://firebase.google.com/docs
