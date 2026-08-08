// 'use client'

// import Link from 'next/link'
// import {
//   ArrowLeft,
//   Calendar,
//   CheckCircle2,
//   Clock,
//   ExternalLink,
//   Loader2,
//   PlayCircle,
//   Radio,
// } from 'lucide-react'

// import { useFirebaseDocument } from '@/lib/hooks/useFirebaseData'
// import { useAuth } from '@/lib/hooks/useAuth'
// import { LiveClassRoom } from '@/components/live-class-room'
// import { Button } from '@/components/ui/button'
// import { Card } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'

// interface LiveClass {
//   id: string
//   title: string
//   course: string
//   instructor: string
//   date: string
//   time: string
//   duration: string
//   status: 'live' | 'upcoming' | 'ended'
//   attendees?: number
//   description?: string
//   meetingLink?: string
//   recordingUrl?: string
//   requirements?: string[]
// }
// export default function LiveClassDetailPage({ params }: { params: { id: string } }) {
//   const { user } = useAuth()
//   const { data: liveClass, loading } = useFirebaseDocument<LiveClass>('liveClasses', params.id)

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20">
//         <Loader2 className="size-10 animate-spin text-primary" />
//         <p className="mt-4 text-sm text-muted-foreground">Loading live class session...</p>
//       </div>
//     )
//   }

//   if (!liveClass) {
//     return (
//       <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
//         <Radio className="mx-auto size-12 text-muted-foreground" />
//         <h2 className="mt-4 text-xl font-bold text-foreground">Live Class Not Found</h2>
//         <p className="mt-2 text-sm text-muted-foreground">
//           The requested class session could not be found or has been removed.
//         </p>
//         <Link href="/live-classes" className="mt-6 inline-block">
//           <Button className="rounded-full">Back to Live Classes</Button>
//         </Link>
//       </div>
//     )
//   }

//   const requirements = liveClass.requirements || [
//     'Stable high-speed internet connection',
//     'Headphones or earphones for clear audio',
//     'Microphone for interactive Q&A (optional)',
//     'Course notebook or coding environment ready',
//   ]

//   return (
//     <div className="mx-auto max-w-6xl pb-12">
//       <div className="mb-6 flex items-center justify-between">
//         <Link href="/live-classes">
//           <Button variant="ghost" size="sm" className="rounded-full text-xs">
//             <ArrowLeft className="mr-1.5 size-4" /> Back to Live Classes
//           </Button>
//         </Link>
//         <Badge variant={liveClass.status === 'live' ? 'live' : 'secondary'} className="capitalize">
//           {liveClass.status}
//         </Badge>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         <div className="space-y-6 lg:col-span-2">
//           {liveClass.status === 'live' ? (
//             user ? (
//               <>
//                 <LiveClassRoom
//                   classId={liveClass.id}
//                   userId={user.uid}
//                   displayName={user.displayName || user.email?.split('@')[0] || 'Student'}
//                 />
//                 {liveClass.meetingLink && (
//                   <Card className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-border/60 p-4">
//                     <p className="text-xs text-muted-foreground">
//                       Having trouble joining the internal room? Use the external meeting link.
//                     </p>
//                     <a href={liveClass.meetingLink} target="_blank" rel="noopener noreferrer">
//                       <Button variant="outline" size="sm" className="rounded-full text-xs">
//                         Open Zoom / Meet <ExternalLink className="ml-1.5 size-3.5" />
//                       </Button>
//                     </a>
//                   </Card>
//                 )}
//               </>
//             ) : (
//               <Card className="rounded-3xl border-red-500/30 bg-red-950/10 p-10 text-center">
//                 <Radio className="mx-auto size-10 text-red-500" />
//                 <h2 className="mt-4 text-xl font-bold">Sign in to join this class</h2>
//                 <Link href="/login" className="mt-5 inline-block">
//                   <Button className="rounded-full">Sign in</Button>
//                 </Link>
//               </Card>
//             )
//           ) : liveClass.status === 'upcoming' ? (
//             <Card className="rounded-3xl border-border/80 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-sm">
//               <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
//                 <Calendar className="mr-1 size-3" /> Upcoming Live Class
//               </Badge>
//               <h2 className="mt-4 text-2xl font-extrabold text-foreground">{liveClass.title}</h2>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Instructor: <span className="font-semibold text-foreground">{liveClass.instructor}</span> ·{' '}
//                 Course: <span className="font-semibold text-foreground">{liveClass.course}</span>
//               </p>
//               <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/40 p-4">
//                 <div className="flex items-center gap-3">
//                   <Clock className="size-5 text-primary" />
//                   <span className="text-sm font-bold">{liveClass.date || 'TBA'}, {liveClass.time || 'TBA'}</span>
//                 </div>
//                 {liveClass.meetingLink && (
//                   <a href={liveClass.meetingLink} target="_blank" rel="noopener noreferrer">
//                     <Button className="rounded-full text-xs">Meeting Link <ExternalLink className="ml-1.5 size-3.5" /></Button>
//                   </a>
//                 )}
//               </div>
//             </Card>
//           ) : (
//             <Card className="rounded-3xl border-border/80 p-8 shadow-sm">
//               <Badge variant="secondary" className="mb-3">Class Concluded</Badge>
//               <h2 className="text-2xl font-bold text-foreground">{liveClass.title}</h2>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Streamed by {liveClass.instructor} on {liveClass.date || 'Past session'}
//               </p>
//               {liveClass.recordingUrl ? (
//                 <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
//                   <Button className="rounded-full text-xs"><PlayCircle className="mr-1.5 size-4" /> Watch Recording</Button>
//                 </a>
//               ) : (
//                 <p className="mt-4 text-xs text-muted-foreground">The recording is being processed and will be available soon.</p>
//               )}
//             </Card>
//           )}

//           <Card className="rounded-3xl border-border/60 p-6">
//             <h3 className="text-lg font-bold text-foreground">About This Live Session</h3>
//             <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
//               {liveClass.description || `Join instructor ${liveClass.instructor} for a comprehensive live deep-dive into ${liveClass.title}. You'll have the opportunity to ask questions in real time and gain practical insights.`}
//             </p>
//           </Card>
//         </div>

//         <div className="space-y-6">
//           <Card className="rounded-3xl border-border/60 p-6">
//             <h3 className="text-lg font-bold text-foreground">Preparation & Requirements</h3>
//             <ul className="mt-4 space-y-2.5">
//               {requirements.map((requirement) => (
//                 <li key={requirement} className="flex items-start gap-2.5 text-xs text-foreground">
//                   <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
//                   <span>{requirement}</span>
//                 </li>
//               ))}
//             </ul>
//           </Card>

//           <Card className="rounded-3xl border-border/60 p-6">
//             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Session Details</h3>
//             <dl className="mt-4 space-y-3 text-xs">
//               <div className="flex justify-between gap-4 border-b border-border/40 py-1.5"><dt className="text-muted-foreground">Course</dt><dd className="font-semibold text-right">{liveClass.course}</dd></div>
//               <div className="flex justify-between gap-4 border-b border-border/40 py-1.5"><dt className="text-muted-foreground">Instructor</dt><dd className="font-semibold text-right">{liveClass.instructor}</dd></div>
//               <div className="flex justify-between gap-4 border-b border-border/40 py-1.5"><dt className="text-muted-foreground">Schedule</dt><dd className="font-semibold text-right">{liveClass.date || 'TBA'} · {liveClass.time || 'TBA'}</dd></div>
//               <div className="flex justify-between gap-4 py-1.5"><dt className="text-muted-foreground">Duration</dt><dd className="font-semibold text-right">{liveClass.duration || '60 min'}</dd></div>
//             </dl>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
