# Firebase Setup - Step-by-Step Visual Guide

## Quick Fix: 5 Minutes

If you're getting "auth/api-key-not-valid" error, follow this quick fix:

### Step 1: Open Firebase Console
```
Go to: https://console.firebase.google.com
```

### Step 2: Select Your Project
- Look for your project in the list (e.g., "student-lms")
- Click on it

### Step 3: Get Your Credentials
1. Click the **gear icon** (⚙️) → **Project Settings**
2. You should see your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### Step 4: Copy All Values
Copy each value carefully. Your file should look like:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy_FULL_KEY_HERE_NO_DOTS
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=student-lms.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=student-lms
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=student-lms.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef0123456789
```

### Step 5: Update .env.local
1. Open `.env.local` in your project
2. Replace the placeholder values with your real Firebase credentials
3. **Important:** No `...` or placeholders - use the FULL API key

### Step 6: Verify & Test
```bash
# Verify configuration
pnpm verify

# If all green, start dev server
pnpm dev

# Open http://localhost:3000 and try to sign up
```

---

## Detailed Setup: 15 Minutes

If quick fix didn't work, follow this complete guide.

### Part 1: Create Firebase Project

#### 1.1 Open Firebase Console
```
https://console.firebase.google.com
```

#### 1.2 Create New Project
- Click **"Create a project"** (or **"Add project"**)
- Enter project name: `student-lms`
- Click **"Continue"**

#### 1.3 Configure Project
- Disable Google Analytics (optional)
- Click **"Create project"**
- Wait for it to finish (1-2 minutes)

#### 1.4 Register Web App
- Click **"</>Add app"** (Web app option)
- Enter app name: `LMS Web App`
- Click **"Register app"**
- **Copy the entire config** - you'll need it next

---

### Part 2: Enable Authentication

#### 2.1 Go to Authentication
In Firebase Console, click **"Authentication"** (left sidebar)

#### 2.2 Get Started
- Click **"Get started"**
- Select **"Email/Password"** provider
- Toggle **"Enable"** ON
- Click **"Save"**

---

### Part 3: Create Firestore Database

#### 3.1 Go to Firestore
In Firebase Console, click **"Firestore Database"** (left sidebar)

#### 3.2 Create Database
- Click **"Create database"**
- Select **"Start in test mode"** (for development)
- Choose region closest to you
- Click **"Create"**

**Important for Production:**
- Later, update security rules (see FIREBASE_FIX_GUIDE.md)

---

### Part 4: Update Environment File

#### 4.1 Locate .env.local
In your project root, you should have `.env.local`

If not, copy from example:
```bash
cp .env.example .env.local
```

#### 4.2 Get Your Firebase Credentials
In Firebase Console:
1. Go to **Project Settings** (gear icon ⚙️)
2. Select **"General"** tab
3. Scroll to **"Your apps"** section
4. Find your web app and click **"Config"**
5. You'll see code like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "student-lms.firebaseapp.com",
  projectId: "student-lms",
  storageBucket: "student-lms.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef0123456789"
};
```

#### 4.3 Update .env.local
Replace the values:

**BEFORE:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project...
```

**AFTER:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=student-lms.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=student-lms
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=student-lms.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef0123456789
```

**Critical Points:**
- Copy the FULL API key (not partial)
- No spaces before/after values
- No `...` remaining
- Save the file

---

### Part 5: Verify Configuration

#### 5.1 Run Verification Script
```bash
pnpm verify
```

You should see all checkmarks (✅):
```
✅ NEXT_PUBLIC_FIREBASE_API_KEY
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
✅ NEXT_PUBLIC_FIREBASE_APP_ID
```

If you see ❌, check that variable in .env.local

#### 5.2 Restart Dev Server
```bash
# Stop current server (Ctrl+C)

# Start new server
pnpm dev
```

---

### Part 6: Test the System

#### 6.1 Open the App
```
http://localhost:3000
```

#### 6.2 Create Test Account
1. Click **"Sign up"** or go to `/signup`
2. Enter:
   - Email: `test@example.com`
   - Password: `test12345` (min 6 chars)
   - Name: `Test User`
3. Click **"Create account"**

#### 6.3 Verify Success
If successful:
- ✅ Redirected to dashboard
- ✅ No error messages
- ✅ See courses on dashboard

If error:
- Check browser console (F12)
- Check terminal for error messages
- Go to next section (Troubleshooting)

---

## Troubleshooting

### Problem: Still getting "auth/api-key-not-valid"

**Check 1: API Key Format**
```
❌ WRONG: AIza...
✅ RIGHT: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Check 2: Complete Key**
```
❌ WRONG: AIzaSyDxxxxx (too short)
✅ RIGHT: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (40+ chars)
```

**Check 3: Starts with AIza**
```
❌ WRONG: NzaSyDxxxxx (starts with N)
✅ RIGHT: AIzaSyDxxxxx (starts with AIza)
```

**Solution:**
1. Go to Firebase Console
2. Go to Project Settings → General
3. Find web app config
4. Copy FULL API key again
5. Update .env.local
6. Restart server: `pnpm dev`

---

### Problem: "Cannot read property 'app' of undefined"

**Cause:** Environment variables not loaded

**Solution:**
1. Verify .env.local exists in project root
2. Verify all 6 variables are set
3. Run: `pnpm verify`
4. Restart dev server: `pnpm dev`

---

### Problem: "Firestore Emulator" connection errors

**Cause:** NEXT_PUBLIC_USE_FIREBASE_EMULATOR is true but emulator isn't running

**Solution:**
1. Edit .env.local
2. Change: `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
3. Restart dev server

---

### Problem: Can sign up but no data in Firestore

**Check 1:** Firestore Database created?
- Firebase Console → Firestore Database
- Should see a database
- Should have collections

**Check 2:** Rules allow write?
- Go to Firestore → Rules tab
- For development, should allow all operations

**Check 3:** Refresh Firestore Console
- Sometimes data shows with delay
- Refresh the page

---

## Success Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] .env.local updated with real credentials
- [ ] `pnpm verify` shows all green
- [ ] Dev server starts without errors
- [ ] Can sign up successfully
- [ ] Can see user in Firestore
- [ ] Dashboard loads without errors

---

## Common Values Reference

| Field | Example | Notes |
|-------|---------|-------|
| API Key | `AIzaSyDxxxxx...` | Starts with "AIza", 40+ characters |
| Auth Domain | `student-lms.firebaseapp.com` | Format: {projectId}.firebaseapp.com |
| Project ID | `student-lms` | Lowercase, no spaces |
| Storage Bucket | `student-lms.firebasestorage.app` | Format: {projectId}.appspot.com |
| Sender ID | `123456789012` | Numeric only, 12 digits |
| App ID | `1:123456789012:web:...` | Format: 1:{senderId}:web:{randomId} |

---

## Need More Help?

1. **Check docs:** See FIREBASE_FIX_GUIDE.md
2. **Run verification:** `pnpm verify`
3. **Check Firebase Console:** https://console.firebase.google.com
4. **Check error message:** Note exact error from browser console
5. **Check terminal:** Look for startup errors

---

**You're almost there! Once Firebase is configured, your LMS will be fully functional.** 🚀
