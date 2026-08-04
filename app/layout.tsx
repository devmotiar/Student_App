import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { isFirebaseConfigured, firebaseInitError } from '@/lib/firebase'
import { FirebaseSetupNotice } from '@/components/firebase-setup-notice'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SITM — Learn Anything, Anywhere',
  description:
    'SITM is a modern e-learning platform with live classes, recorded lessons, and a personalized dashboard to track your progress.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        {isFirebaseConfigured && !firebaseInitError ? (
          <AuthProvider>{children}</AuthProvider>
        ) : (
          <FirebaseSetupNotice errorMessage={firebaseInitError} />
        )}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
