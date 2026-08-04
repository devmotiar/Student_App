import { AlertTriangle } from 'lucide-react'

export function FirebaseSetupNotice({ errorMessage }: { errorMessage?: string | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <AlertTriangle className="size-5" />
          </span>
          <h1 className="text-lg font-semibold">Firebase isn&apos;t configured yet</h1>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
            <span className="font-semibold">Error:</span> {errorMessage}
          </div>
        )}

        <p className="text-sm leading-relaxed text-slate-300">
          This app needs your real Firebase project credentials to run. Follow these steps:
        </p>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>
            In the project root, copy <code className="rounded bg-slate-800 px-1.5 py-0.5">.env.example</code>{' '}
            to a new file named{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5">.env.local</code>.
          </li>
          <li>
            Go to the{' '}
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Firebase Console
            </a>{' '}
            → your project → Settings (gear icon) → General tab → scroll to &quot;Your apps&quot; and
            copy the config values.
          </li>
          <li>
            Paste each value into <code className="rounded bg-slate-800 px-1.5 py-0.5">.env.local</code>{' '}
            (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
          </li>
          <li>
            Make sure <strong>Authentication</strong> (Email/Password) and{' '}
            <strong>Cloud Firestore</strong> are both enabled for your project.
          </li>
          <li>
            Stop the dev server and restart it (
            <code className="rounded bg-slate-800 px-1.5 py-0.5">pnpm dev</code>) so the new
            environment variables are picked up.
          </li>
        </ol>

        <p className="mt-5 text-xs text-slate-500">
          Note: environment files (<code>.env.local</code>) are not included when this project is
          zipped/shared, since they contain secrets specific to your Firebase project — you always
          need to create this file yourself on each machine you run the app on.
        </p>
      </div>
    </div>
  )
}
