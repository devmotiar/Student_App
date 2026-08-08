'use client'

import { useCallback, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail } from '@/lib/firebase-auth-operations'

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Firebase errors arrive as `Firebase: Error (auth/xxx-yyy).` —
 * we extract the `auth/xxx-yyy` code and translate it so users
 * never see raw SDK error text.
 */
function getAuthErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : ''
  const codeMatch = rawMessage.match(/auth\/[a-z-]+/)
  const code = codeMatch?.[0] ?? ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    case 'auth/missing-password':
      return 'Please enter your password.'
    default:
      return 'Sign in failed. Please check your details and try again.'
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('Demo@1234')

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError('')
      setLoading(true)

      try {
        await signInWithEmail(email, password)
        router.push('/dashboard')
      } catch (err) {
        setError(getAuthErrorMessage(err))
      } finally {
        setLoading(false)
      }
    },
    [email, password, router],
  )

  const togglePasswordVisibility = useCallback(() => setShowPassword((v) => !v), [])

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue learning where you left off.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
        {error && (
          <div className="rounded-lg bg-red-50 p-3 flex gap-3 items-start" role="alert" aria-live="assertive">
            <AlertCircle className="size-4 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            aria-invalid={!!error}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
              required
              disabled={loading}
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
          <input
            type="checkbox"
            name="rememberMe"
            className="size-4 rounded border-input accent-primary"
            disabled={loading}
          />
          Remember me for 30 days
        </label>

        <Button type="submit" className="h-11 w-full text-sm" disabled={loading} aria-busy={loading}>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up for free
        </Link>
      </p>
    </AuthShell>
  )
}