'use client'

import { useCallback, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail } from '@/lib/firebase-auth-operations'

const MIN_PASSWORD_LENGTH = 6

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const passwordMeetsMinLength = password.length >= MIN_PASSWORD_LENGTH

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError('')

      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        return
      }

      if (!agreeTerms) {
        setError('You must agree to the terms and conditions')
        return
      }

      setLoading(true)

      try {
        await signUpWithEmail(email, password, name)
        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign up failed')
      } finally {
        setLoading(false)
      }
    },
    [email, password, name, agreeTerms, router],
  )

  const togglePasswordVisibility = useCallback(() => setShowPassword((v) => !v), [])

  return (
    <AuthShell title="Create your account" subtitle="Start learning today. No credit card required.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div
            className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3 shadow-sm animate-in fade-in-0 slide-in-from-top-1 duration-200"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="size-4 flex-shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            aria-invalid={!!error}
            className="transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
              required
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby="password-hint"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="size-4 transition-transform" aria-hidden="true" />
              ) : (
                <Eye className="size-4 transition-transform" aria-hidden="true" />
              )}
            </button>
          </div>
          <p
            id="password-hint"
            className={`text-xs transition-colors ${
              password.length > 0 && passwordMeetsMinLength
                ? 'text-emerald-600'
                : 'text-muted-foreground'
            }`}
          >
            Must be at least {MIN_PASSWORD_LENGTH} characters long.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground select-none">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 size-4 rounded border-input accent-primary transition-colors"
            disabled={loading}
          />
          <span>
            I agree to the{' '}
            <span className="font-medium text-primary transition-colors hover:text-primary/80">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-medium text-primary transition-colors hover:text-primary/80">
              Privacy Policy
            </span>
            .
          </span>
        </label>

        <Button
          type="submit"
          className="h-11 w-full text-sm transition-transform active:scale-[0.98]"
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary transition-colors hover:underline hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}