# Firebase Real-Time LMS - Quick Start Guide

Get your Learning Management System with Firebase real-time data up and running in 5 minutes!

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Name it **"LMS"**
3. Click **"Create project"** and wait for setup

### Step 2: Set Up Firestore

1. In Firebase Console, click **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** → Select your region → **Create**

### Step 3: Get Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → **Project Settings**
2. Scroll to **"Your apps"** section
3. Click the web app icon `</>`
4. Copy the entire `firebaseConfig` object

### Step 4: Set Environment Variables

1. Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

2. Paste your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lms-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lms-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lms-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...
```

### Step 5: Seed Data

```bash
# Install dependencies (if not already done)
pnpm install

# Seed Firebase with sample data
pnpm seed
```

### Step 6: Run the App

```bash
pnpm dev
```

Visit `http://localhost:3000` 🎉

## 🎯 What You Get

✅ **Real-time Dashboard** - Courses, stats, and live classes update instantly
✅ **Live Classes** - Attendee counts update in real-time  
✅ **Course Progress** - See progress changes immediately
✅ **Video Views** - View counts update as users watch
✅ **Responsive UI** - Works great on mobile and desktop

## 📊 File Structure

```
src/
├── lib/
│   ├── firebase.ts              # Firebase config
│   ├── firebase-operations.ts   # Database helpers
│   └── hooks/
│       └── useFirebaseData.ts    # Real-time hook
└── app/(app)/
    ├── dashboard/page.tsx        # Real-time dashboard
    ├── courses/page.tsx          # Real-time courses
    ├── live-classes/page.tsx     # Real-time classes
    └── recorded-videos/page.tsx  # Real-time videos
```

## 🔄 Real-Time Features in Action

### Dashboard
- Shows courses with real-time progress updates
- Displays live classes with current attendee counts
- Updates automatically as data changes

### Courses Page
- View all courses in real-time
- Filter by progress status
- See course count updates instantly

### Live Classes Page
- Real-time class status (live/upcoming/ended)
- Live attendee count that updates as users join
- Automatic status changes

### Recorded Videos Page
- Real-time video list
- View counts update as users watch
- Watch status changes instantly

## 🧪 Test Real-Time Updates

1. Open the app on two browser tabs
2. Go to **Live Classes** on both tabs
3. Click **"Join class"** on one tab
4. Watch the attendee count increase on both tabs instantly! 🚀

## 🐛 Troubleshooting

### "Data not loading"
- Check `.env.local` has all Firebase config
- Verify Firestore collections exist in Firebase Console
- Check browser console for errors

### "Permission denied" errors
- Go to Firestore → Rules
- Make sure rules allow reads: `allow read: if true;`

### "Seed script fails"
```bash
# Make sure .env.local is set
cat .env.local

# Try again
pnpm seed
```

## 📚 Collections Schema

Three main collections in Firestore:

### `courses` - Learning courses
```json
{
  "title": "Modern Web Development with React",
  "instructor": "Sarah Chen",
  "progress": 68,
  "students": 12840,
  "rating": 4.9
}
```

### `liveClasses` - Live class sessions
```json
{
  "title": "Building Reusable Components in React",
  "instructor": "Sarah Chen",
  "status": "live",
  "attendees": 214
}
```

### `recordedVideos` - Video recordings
```json
{
  "title": "Introduction to React Hooks",
  "duration": "24:15",
  "views": 4820,
  "watched": true
}
```

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel settings
4. Deploy! 🎉

## 🔐 Security Rules (Production)

Before deploying to production, update Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access
    match /courses/{document=**} {
      allow read: if true;
    }
    
    // Authenticated user data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 📖 Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure environment variables  
3. ✅ Seed data with `pnpm seed`
4. ✅ Run app with `pnpm dev`
5. 📚 Learn more: Read `FIREBASE_SETUP.md`
6. 🔧 Explore: Check `FIREBASE_IMPLEMENTATION.md`
7. 🚀 Deploy to Vercel

## 💡 Pro Tips

- Use Firebase Console to monitor real-time data changes
- Check Network tab in DevTools to see real-time updates
- Add your own courses by manually creating documents in Firestore
- Extend hooks for advanced features like pagination
- Set up Cloud Functions for complex operations

## 🆘 Need Help?

- Check browser console for errors
- Review Firebase Console logs
- Read the detailed guides in `FIREBASE_SETUP.md` and `FIREBASE_IMPLEMENTATION.md`
- Visit [Firebase Docs](https://firebase.google.com/docs)

---

**That's it! You now have a real-time LMS with Firebase. Happy learning! 🎓**
