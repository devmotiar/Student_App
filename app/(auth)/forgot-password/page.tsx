'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 700)
  }

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? 'We sent you a link to reset your password.'
          : 'Enter your email and we will send you a reset link.'
      }
    >
      {sent ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-accent/40 p-4">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground leading-relaxed">
              A reset link was sent to{' '}
              <span className="font-medium">{email || 'your email'}</span>. The link
              expires in 30 minutes.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-11 w-full text-sm"
            onClick={() => setSent(false)}
          >
            Resend email
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="h-11 w-full text-sm" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? 'Sending link...' : 'Send reset link'}
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
