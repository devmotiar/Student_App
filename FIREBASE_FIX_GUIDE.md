# Firebase Configuration - Complete Setup Guide

## Error: "auth/api-key-not-valid.-Please-pass-a-valid-api-key."

This error occurs when your Firebase API key is missing or invalid. Follow these steps to fix it.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter a project name (e.g., "student-lms")
4. Click **"Continue"**
5. Disable Google Analytics (optional)
6. Click **"Create project"**
7. Wait for project creation to complete

---

## Step 2: Get Your Firebase Credentials

### Method 1: From Project Settings (Recommended)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Select **"General"** tab
3. Scroll down to **"Your apps"** section
4. If no apps exist, click **"Add app"** → Select **"Web"** (</> icon)
5. Enter an app nickname (e.g., "LMS Web App")
6. Click **"Register app"**
7. You'll see your Firebase config. Copy these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                          // YOUR API KEY
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Method 2: From Web App Settings

1. In Firebase Console, go to **Project Settings**
2. Click on the **"Apps"** section
3. Find your web app and click the **"Config"** button
4. Copy the entire config object

---

## Step 3: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Click **"Email/Password"** provider
4. Toggle **"Enable"** on
5. Click **"Save"**

---

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose your region (closest to your location)
5. Click **"Create"**

*Note: In production, change test mode to enforced rules*

---

## Step 5: Update Environment Variables

### Create .env.local File

In your project root, create/edit `.env.local`:

```bash
# Firebase Configuration - Copy from your Firebase Project Settings
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...YOUR_FULL_API_KEY...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef0123456789

# Optional: For local Firebase Emulator
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

### How to Find Each Value

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Web app config | `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Config → authDomain | `student-lms.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Config → projectId | `student-lms` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Config → storageBucket | `student-lms.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Config → messagingSenderId | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Config → appId | `1:123456789012:web:abcdef0123456789` |

---

## Step 6: Verify Configuration

### Check Variables Are Loaded

In your terminal:

```bash
cd /vercel/share/v0-project
cat .env.local
```

Verify you see your Firebase credentials (not placeholders like `AIza...`)

### Restart Dev Server

```bash
# Stop the running dev server (Ctrl+C)
# Then restart:
pnpm dev
```

---

## Step 7: Test Authentication

1. Open http://localhost:3000
2. Click **"Sign up"**
3. Enter credentials:
   - Email: test@example.com
   - Password: password123
4. Click **"Create account"**

If successful, you'll be redirected to dashboard. If you get the API key error, check step 5 again.

---

## Common Issues & Solutions

### Issue 1: "auth/api-key-not-valid"

**Cause:** API key is incomplete or invalid

**Solution:**
- Copy the FULL API key from Firebase Console
- Ensure no spaces before/after the key
- Restart dev server after updating .env.local

### Issue 2: "auth/invalid-api-key"

**Cause:** API key format is wrong

**Solution:**
- Verify key starts with `AIza`
- Verify it's the Web API key, not Android/iOS key
- Get fresh credentials from Firebase Console

### Issue 3: "auth/unauthorized-domain"

**Cause:** Your domain isn't authorized

**Solution:**
- Go to Firebase Console → Authentication → Settings
- Add `localhost:3000` to Authorized domains (for dev)
- Add your Vercel domain for production

### Issue 4: "Cannot read property 'app' of undefined"

**Cause:** Environment variables not loaded

**Solution:**
- Verify .env.local exists in project root
- Restart dev server completely
- Check no typos in variable names (must start with `NEXT_PUBLIC_`)

---

## Production Deployment

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add all Firebase variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Click **"Deploy"** to redeploy with new env vars

### Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your Vercel domain (e.g., `my-lms.vercel.app`)
4. Save

---

## Verification Checklist

- [ ] Firebase project created
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Web app registered in Firebase
- [ ] `.env.local` file created with full credentials
- [ ] All 6 environment variables filled in
- [ ] No placeholder values remaining
- [ ] Dev server restarted
- [ ] Can sign up successfully
- [ ] Can sign in with credentials
- [ ] Progress appears in Firestore

---

## Firebase Console Quick Links

- Project Settings: https://console.firebase.google.com/project/_/settings/general
- Authentication: https://console.firebase.google.com/project/_/authentication/providers
- Firestore: https://console.firebase.google.com/project/_/firestore
- Real-time Database: https://console.firebase.google.com/project/_/database

(Replace `_` with your project ID)

---

## Need Help?

1. **Verify Firebase Console** - Check all credentials are correct
2. **Check .env.local** - Ensure no spaces, complete values
3. **Restart Dev Server** - `pnpm dev` after env changes
4. **Check Browser Console** - F12 to see detailed errors
5. **Check Terminal** - Look for error messages during startup

---

## Success Indicators

✅ After setup, you should see:
- Successful signup/login without errors
- User data appearing in Firestore
- Real-time updates on dashboard
- No API key errors in console
- Can join live classes
- Can watch videos with progress tracking

**You're all set! Your Firebase LMS is now ready to use.**
