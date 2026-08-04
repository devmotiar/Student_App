# Learning Management System with Firebase Real-Time Data

A modern, real-time Learning Management System built with Next.js 16, React 19, and Firebase Firestore. Features real-time synchronization across all components for a seamless learning experience.

## ✨ Features

🔄 **Real-Time Data Sync**
- All data updates instantly across connected clients
- Attendee counts update as users join classes
- Progress changes reflect immediately
- View counts update in real-time

📚 **Course Management**
- Browse all available courses
- Track learning progress
- Filter by progress status
- View course details and instructor info

🎓 **Live Classes**
- Join live interactive sessions
- See real-time attendee counts
- Categorized by status (live, upcoming, ended)
- Watch recordings of past sessions

🎥 **Recorded Videos**
- Access recorded lessons anytime
- Track watch history
- See view counts
- Learn at your own pace

📊 **Dashboard**
- Overview of your learning journey
- In-progress courses
- Upcoming live classes
- Recommended courses based on your level

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Firebase project account

### Setup (5 minutes)

```bash
# 1. Clone/extract the project
cd learning-management-system

# 2. Install dependencies
pnpm install

# 3. Create .env.local with Firebase config
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# 4. Seed the database
pnpm seed

# 5. Start development server
pnpm dev
```

Visit `http://localhost:3000` 🎉

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Fast 5-minute setup guide
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md)** - Technical implementation details
- **[EXAMPLES.md](./EXAMPLES.md)** - Code examples and patterns

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (ready to integrate)
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── dashboard/            # Real-time dashboard
│   │   ├── courses/              # Real-time courses catalog
│   │   ├── live-classes/         # Real-time live classes
│   │   └── recorded-videos/      # Real-time video library
│   ├── (auth)/                   # Auth routes (login, signup)
│   └── layout.tsx
├── components/
│   ├── app/                      # App-specific components
│   └── ui/                       # shadcn UI components
├── lib/
│   ├── firebase.ts               # Firebase initialization
│   ├── firebase-operations.ts    # Database operations
│   ├── hooks/
│   │   └── useFirebaseData.ts    # Real-time data hooks
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
└── scripts/
    └── seed-firebase.mjs         # Database seeding script
```

## 🔄 Real-Time Data Flow

```
Firestore Database
       ↓
useFirebaseData Hook
       ↓
Real-time Listener (onSnapshot)
       ↓
React State Update
       ↓
Component Re-render
       ↓
Browser UI Update (Instant!)
```

## 🎯 Key Components

### `useFirebaseData` Hook
Real-time data fetching hook for collections:
```typescript
const { data, loading, error } = useFirebaseData('courses')
```

### `useFirebaseDocument` Hook
Real-time single document fetching:
```typescript
const { data, loading, error } = useFirebaseDocument('courses', courseId)
```

### Firebase Operations
Helper functions for CRUD operations:
- `addDocument()` - Create new documents
- `updateDocument()` - Update existing documents
- `deleteDocument()` - Delete documents
- `updateCourseProgress()` - Track progress
- `markVideoWatched()` - Update watch status
- `incrementLiveClassAttendees()` - Track attendance

## 🔐 Security

### Development
For quick setup, Firestore allows all reads and writes in test mode.

### Production
Before deploying, implement proper security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /courses/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 📊 Firestore Collections

### `courses`
Course information with progress tracking
- `id`, `title`, `instructor`, `category`
- `lessons`, `duration`, `level`
- `progress`, `rating`, `students`

### `liveClasses`
Live session information
- `id`, `title`, `instructor`, `course`
- `date`, `time`, `duration`
- `status` (live/upcoming/ended)
- `attendees` (real-time count)

### `recordedVideos`
Recorded lesson information
- `id`, `title`, `instructor`, `course`
- `duration`, `views` (real-time)
- `watched` (user tracking)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Deploy! 🎉

## 🧪 Testing Real-Time Features

1. Open app on two browser windows
2. Navigate to **Live Classes**
3. Click **"Join class"** on one window
4. Watch the attendee count update instantly on both windows!

## 🐛 Troubleshooting

### Data not loading?
- Check `.env.local` has correct Firebase config
- Verify Firestore collections exist
- Check browser console for errors

### Permission denied?
- Go to Firestore → Rules
- Ensure development rules allow reads: `allow read: if true;`

### Build errors?
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Rebuild: `pnpm build`

## 📚 Learning Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🔗 Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm seed             # Seed Firebase with sample data

# Useful links
# Firebase Console: https://console.firebase.google.com
# Next.js Docs: https://nextjs.org/docs
```

## 🎓 Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure environment variables
3. ✅ Seed initial data
4. ✅ Run development server
5. 📝 Customize courses and content
6. 🔐 Implement Firebase Authentication
7. 🚀 Deploy to production

## 💡 Extending the Project

### Add Authentication
```typescript
import { auth } from '@/lib/firebase'
import { signIn, signOut } from 'firebase/auth'
```

### Add User-Specific Data
```typescript
const userId = auth.currentUser?.uid
const { data: userCourses } = useFirebaseData(
  `users/${userId}/courses`
)
```

### Add Analytics
```typescript
import { analytics } from '@/lib/firebase'
import { logEvent } from 'firebase/analytics'
```

## 📄 License

MIT License - Feel free to use this project for learning and personal use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest improvements
- Create pull requests
- Share feedback

## 📞 Support

If you need help:
1. Check the documentation in `FIREBASE_SETUP.md`
2. Review code examples in `EXAMPLES.md`
3. Check the [Firebase Docs](https://firebase.google.com/docs)
4. Review browser console for error messages

---

**Built with ❤️ using Next.js and Firebase**

Happy learning! 🎓✨
