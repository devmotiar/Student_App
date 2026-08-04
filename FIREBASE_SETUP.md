# Firebase Setup Guide for LMS

This Learning Management System now uses Firebase Firestore for real-time data. Follow these steps to set up your Firebase project.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "LMS-Project")
4. Select location and create the project

## 2. Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your region
5. Create the database

## 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the Web app icon `</>`
4. Copy your Firebase config object

## 4. Set Up Environment Variables

Create a `.env.local` file in your project root with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

⚠️ **Note:** These are public keys (they start with `NEXT_PUBLIC_`), so they're meant to be exposed in the browser.

## 5. Create Firestore Collections and Add Sample Data

### Collections to Create:

#### 1. **courses** collection

Add documents with the following structure:

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
  "level": "Intermediate"
}
```

#### 2. **liveClasses** collection

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
  "attendees": 214
}
```

#### 3. **recordedVideos** collection

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
  "watched": true
}
```

## 6. Update Firestore Security Rules (for development)

In Firebase Console, go to **Firestore Database** → **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For development: allow all reads and writes
    match /{document=**} {
      allow read, write: if true;
    }
    
    // For production: implement proper authentication
    // match /courses/{document=**} {
    //   allow read: if true;
    //   allow write: if request.auth != null;
    // }
  }
}
```

## 7. Install Dependencies

The Firebase SDK is already installed. If needed, run:

```bash
pnpm install firebase
```

## 8. Start the Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 to see the LMS with real-time Firebase data.

## Real-Time Features

The LMS now features real-time data synchronization:

- **Dashboard**: Displays courses and live classes that update in real-time
- **Courses Page**: Shows all courses with real-time progress updates
- **Live Classes Page**: Real-time attendee counts and class status
- **Recorded Videos Page**: Real-time view counts and watch status

## Available Hooks

### `useFirebaseData`

Fetch and listen to real-time data from a Firestore collection:

```typescript
const { data, loading, error } = useFirebaseData('courses')
```

### `useFirebaseDocument`

Fetch and listen to a specific document:

```typescript
const { data, loading, error } = useFirebaseDocument('courses', courseId)
```

## Firebase Operations

Available functions in `lib/firebase-operations.ts`:

- `addDocument()` - Add new document
- `updateDocument()` - Update existing document
- `deleteDocument()` - Delete document
- `updateCourseProgress()` - Update course progress
- `markVideoWatched()` - Mark video as watched
- `joinLiveClass()` - Join a live class
- `incrementLiveClassAttendees()` - Increment live class attendance

## Example: Update Course Progress

```typescript
import { updateCourseProgress } from '@/lib/firebase-operations'

await updateCourseProgress('user-id', 'course-id', 75)
```

## Troubleshooting

### Data not loading?
1. Check that Firestore collections and documents are created
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure Firestore security rules allow reads

### Permission denied errors?
1. Go to Firestore Rules and ensure they allow reads for your development setup
2. Temporarily use test mode with `allow read, write: if true`

### Emulator Setup (Optional)

To use Firebase Emulator Suite locally:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize emulator: `firebase init emulator`
3. Start emulator: `firebase emulators:start`
4. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local`

## Production Deployment

Before deploying to production:

1. Set up proper Firestore security rules with authentication
2. Use a production Firebase project
3. Remove test mode access from Firestore
4. Enable Firebase Authentication
5. Set up proper user scoping for data access
6. Review and follow Firebase best practices

---

For more information, visit [Firebase Documentation](https://firebase.google.com/docs)
