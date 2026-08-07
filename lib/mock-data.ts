export type Course = {
  id: string
  title: string
  category: string
  instructor: string
  image: string
  thumbnail?: string
  youtubeUrl?: string
  lessons: number
  duration: string
  progress: number
  rating: number
  students: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

export const courses: Course[] = [
  {
    id: 'web-dev',
    title: 'Modern Web Development with React',
    category: 'Development',
    instructor: 'Sarah Chen',
    image: '/courses/web-development.png',
    lessons: 42,
    duration: '18h 30m',
    progress: 68,
    rating: 4.9,
    students: 12840,
    level: 'Intermediate',
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics Bootcamp',
    category: 'Data',
    instructor: 'Dr. Amir Hassan',
    image: '/courses/data-science.png',
    lessons: 56,
    duration: '24h 10m',
    progress: 35,
    rating: 4.8,
    students: 9310,
    level: 'Beginner',
  },
  {
    id: 'ux-design',
    title: 'UI/UX Design Fundamentals',
    category: 'Design',
    instructor: 'Mia Rodriguez',
    image: '/courses/ux-design.png',
    lessons: 38,
    duration: '15h 45m',
    progress: 92,
    rating: 4.9,
    students: 15620,
    level: 'Beginner',
  },
  {
    id: 'marketing',
    title: 'Digital Marketing Masterclass',
    category: 'Marketing',
    instructor: 'James Okoro',
    image: '/courses/marketing.png',
    lessons: 31,
    duration: '12h 20m',
    progress: 12,
    rating: 4.7,
    students: 8045,
    level: 'Intermediate',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning A-Z',
    category: 'Data',
    instructor: 'Dr. Amir Hassan',
    image: '/courses/machine-learning.png',
    lessons: 64,
    duration: '30h 05m',
    progress: 0,
    rating: 4.8,
    students: 20140,
    level: 'Advanced',
  },
  {
    id: 'photography',
    title: 'Photography for Beginners',
    category: 'Creative',
    instructor: 'Lena Novak',
    image: '/courses/photography.png',
    lessons: 27,
    duration: '9h 50m',
    progress: 54,
    rating: 4.6,
    students: 6720,
    level: 'Beginner',
  },
]

export type LiveClass = {
  id: string
  title: string
  course: string
  instructor: string
  date: string
  time: string
  duration: string
  status: 'live' | 'upcoming' | 'ended'
  attendees: number
}

export const liveClasses: LiveClass[] = [
  {
    id: 'lc-1',
    title: 'Building Reusable Components in React',
    course: 'Modern Web Development',
    instructor: 'Sarah Chen',
    date: 'Today',
    time: '2:00 PM',
    duration: '60 min',
    status: 'live',
    attendees: 214,
  },
  {
    id: 'lc-2',
    title: 'Exploratory Data Analysis with Pandas',
    course: 'Data Science Bootcamp',
    instructor: 'Dr. Amir Hassan',
    date: 'Today',
    time: '5:30 PM',
    duration: '90 min',
    status: 'upcoming',
    attendees: 156,
  },
  {
    id: 'lc-3',
    title: 'Designing Accessible Interfaces',
    course: 'UI/UX Design Fundamentals',
    instructor: 'Mia Rodriguez',
    date: 'Tomorrow',
    time: '11:00 AM',
    duration: '75 min',
    status: 'upcoming',
    attendees: 189,
  },
  {
    id: 'lc-4',
    title: 'SEO Strategy Workshop',
    course: 'Digital Marketing Masterclass',
    instructor: 'James Okoro',
    date: 'Jun 12',
    time: '3:00 PM',
    duration: '60 min',
    status: 'upcoming',
    attendees: 98,
  },
  {
    id: 'lc-5',
    title: 'Neural Networks Deep Dive',
    course: 'Machine Learning A-Z',
    instructor: 'Dr. Amir Hassan',
    date: 'Jun 8',
    time: '1:00 PM',
    duration: '120 min',
    status: 'ended',
    attendees: 342,
  },
]

export type RecordedVideo = {
  id: string
  title: string
  course: string
  instructor: string
  image: string
  duration: string
  views: number
  uploaded: string
  watched: boolean
}

export const recordedVideos: RecordedVideo[] = [
  {
    id: 'rv-1',
    title: 'Introduction to React Hooks',
    course: 'Modern Web Development',
    instructor: 'Sarah Chen',
    image: '/courses/web-development.png',
    duration: '24:15',
    views: 4820,
    uploaded: '2 days ago',
    watched: true,
  },
  {
    id: 'rv-2',
    title: 'Cleaning Messy Datasets',
    course: 'Data Science Bootcamp',
    instructor: 'Dr. Amir Hassan',
    image: '/courses/data-science.png',
    duration: '38:42',
    views: 3110,
    uploaded: '4 days ago',
    watched: false,
  },
  {
    id: 'rv-3',
    title: 'Color Theory in Practice',
    course: 'UI/UX Design Fundamentals',
    instructor: 'Mia Rodriguez',
    image: '/courses/ux-design.png',
    duration: '19:03',
    views: 5640,
    uploaded: '1 week ago',
    watched: true,
  },
  {
    id: 'rv-4',
    title: 'Running Your First Ad Campaign',
    course: 'Digital Marketing Masterclass',
    instructor: 'James Okoro',
    image: '/courses/marketing.png',
    duration: '31:27',
    views: 2280,
    uploaded: '1 week ago',
    watched: false,
  },
  {
    id: 'rv-5',
    title: 'Understanding Gradient Descent',
    course: 'Machine Learning A-Z',
    instructor: 'Dr. Amir Hassan',
    image: '/courses/machine-learning.png',
    duration: '42:58',
    views: 7190,
    uploaded: '2 weeks ago',
    watched: false,
  },
  {
    id: 'rv-6',
    title: 'Composition & Framing Basics',
    course: 'Photography for Beginners',
    instructor: 'Lena Novak',
    image: '/courses/photography.png',
    duration: '16:44',
    views: 1980,
    uploaded: '3 weeks ago',
    watched: true,
  },
]

export const currentUser = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  initials: 'AM',
  role: 'Student',
}

export const dashboardStats = [
  { label: 'Enrolled Courses', value: '6', hint: '+2 this month' },
  { label: 'Hours Learned', value: '48.5', hint: '+6.2 this week' },
  { label: 'Certificates', value: '3', hint: '1 in progress' },
  { label: 'Day Streak', value: '12', hint: 'Keep it up!' },
]
