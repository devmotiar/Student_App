# Firebase Real-Time Data Implementation

This document outlines the Firebase real-time data integration in the Learning Management System.

## 📚 Project Structure

```
project/
├── lib/
│   ├── firebase.ts                 # Firebase initialization
│   ├── firebase-operations.ts      # Database operations
│   └── hooks/
│       └── useFirebaseData.ts       # React hooks for real-time data
├── app/
│   ├── (app)/
│   │   ├── dashboard/page.tsx       # Real-time dashboard
│   │   ├── courses/page.tsx         # Real-time courses
│   │   ├── live-classes/page.tsx    # Real-time live classes
│   │   └── recorded-videos/page.tsx # Real-time videos
├── scripts/
│   └── seed-firebase.mjs            # Database seeding script
├── FIREBASE_SETUP.md                # Setup instructions
└── .env.example                     # Environment variables template
```

## 🔧 Core Components

### 1. Firebase Configuration (`lib/firebase.ts`)

Initializes Firebase with your project credentials:

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
}

export const db = getFirestore(app)
export const auth = getAuth(app)
```

### 2. Custom React Hooks (`lib/hooks/useFirebaseData.ts`)

Provides real-time data listeners to React components:

#### `useFirebaseData` Hook

Fetches and subscribes to real-time updates from a collection:

```typescript
const { data, loading, error } = useFirebaseData('courses')
```

**Features:**
- Real-time synchronization with Firestore
- Automatic cleanup on unmount
- Error handling
- Loading state

#### `useFirebaseDocument` Hook

Fetches a specific document and listens for updates:

```typescript
const { data, loading, error } = useFirebaseDocument('courses', courseId)
```

### 3. Database Operations (`lib/firebase-operations.ts`)

Helper functions for common database operations:

- **`addDocument(collection, data)`** - Create new document
- **`updateDocument(collection, docId, data)`** - Update existing document
- **`deleteDocument(collection, docId)`** - Delete document
- **`updateCourseProgress(userId, courseId, progress)`** - Update progress
- **`markVideoWatched(userId, videoId)`** - Mark video as watched
- **`joinLiveClass(userId, liveClassId)`** - Record attendance
- **`incrementLiveClassAttendees(liveClassId)`** - Increment attendee count

All operations automatically add/update timestamps.

## 🚀 Real-Time Pages

### Dashboard Page (`app/(app)/dashboard/page.tsx`)

**Features:**
- Real-time course display with progress
- Live class updates with current attendee count
- Stats card that refresh as data changes

```typescript
'use client'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

export default function DashboardPage() {
  const { data: courses, loading: coursesLoading } = useFirebaseData('courses')
  const { data: liveClasses, loading: classesLoading } = useFirebaseData('liveClasses')
  
  // Component updates in real-time as Firebase data changes
}
```

### Courses Page (`app/(app)/courses/page.tsx`)

**Features:**
- Real-time course list
- Filter by progress status
- Live course count updates

### Live Classes Page (`app/(app)/live-classes/page.tsx`)

**Features:**
- Real-time class status (live, upcoming, ended)
- Live attendee count
- Automatic updates as class status changes

### Recorded Videos Page (`app/(app)/recorded-videos/page.tsx`)

**Features:**
- Real-time video list
- Live view counts
- Watch status synchronization

## 🔄 Data Flow

```
Firestore Database
        ↓
useFirebaseData Hook
        ↓
Realtime Listener (onSnapshot)
        ↓
Component Re-render
        ↓
Browser UI Update
```

## 📝 Firestore Schema

### Collections

#### `courses`
```json
{
  "id": "web-dev",
  "title": "Modern Web Development with React",
  "category": "Development",
  "instructor": "Sarah Chen",
  "image": "/courses/web-development.png",
  "lessons": 42,
  "duration": "18h 30m",
  "progress": 68,
  "rating": 4.9,
  "students": 12840,
  "level": "Intermediate",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### `liveClasses`
```json
{
  "id": "lc-1",
  "title": "Building Reusable Components in React",
  "course": "Modern Web Development",
  "instructor": "Sarah Chen",
  "date": "Today",
  "time": "2:00 PM",
  "duration": "60 min",
  "status": "live",
  "attendees": 214,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### `recordedVideos`
```json
{
  "id": "rv-1",
  "title": "Introduction to React Hooks",
  "course": "Modern Web Development",
  "instructor": "Sarah Chen",
  "image": "/courses/web-development.png",
  "duration": "24:15",
  "views": 4820,
  "uploaded": "2 days ago",
  "watched": true,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## 🛠️ Seeding Data

The project includes a seeding script to populate Firestore with sample data:

```bash
# First, copy and configure .env.local with your Firebase credentials
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Install dependencies
pnpm install

# Seed Firestore with sample data
pnpm seed
```

The seed script:
1. Clears existing collections
2. Populates with sample courses, live classes, and recorded videos
3. Validates the data was added successfully

## 🔐 Security Considerations

### Development Mode
For quick setup and testing, use test mode with:
```javascript
allow read, write: if true;
```

### Production Mode
Before deploying, implement proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read
    match /courses/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Users can only read their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 📊 Real-Time Updates Example

When a user joins a live class:

1. **Frontend**: User clicks "Join class" button
2. **Operation**: `incrementLiveClassAttendees(liveClassId)` called
3. **Firebase**: Document updated with incremented attendee count
4. **Real-time Sync**: All connected clients receive the update instantly
5. **UI**: Attendee count updates in real-time across all instances

## 🐛 Debugging

### Check Console Logs
Browser console shows real-time listener status and errors.

### Verify Data in Firebase Console
- Go to Firestore Database in Firebase Console
- Check collections exist and contain data
- View real-time updates as you interact with the app

### Check Environment Variables
```bash
# Make sure .env.local has all required variables
cat .env.local | grep FIREBASE
```

### Common Issues

**Data not loading?**
- Verify Firestore collections are created
- Check security rules allow reads
- Ensure Firebase config is correct

**Infinite loading spinner?**
- Check browser console for errors
- Verify Firebase initialization
- Check network tab for failed requests

## 🚀 Deployment

### Vercel Deployment

1. **Set environment variables** in Vercel project settings:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

2. **Deploy with**: `git push` (Vercel auto-deploys on push)

3. **Verify**: Check Vercel dashboard for successful deployment

### Firebase Project Setup for Production

1. Upgrade from test mode (if using emulator)
2. Set up proper security rules
3. Enable authentication methods
4. Configure custom domain
5. Enable HTTPS (automatically on Vercel)

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Real-time Listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🔄 Next Steps

1. ✅ Install Firebase SDK (done)
2. ✅ Create custom hooks (done)
3. ✅ Implement real-time pages (done)
4. 📝 Set up Firebase project and environment variables
5. 📝 Seed initial data with `pnpm seed`
6. 📝 Test real-time updates
7. 📝 Deploy to production with proper security rules

---

For detailed setup instructions, see `FIREBASE_SETUP.md`.
