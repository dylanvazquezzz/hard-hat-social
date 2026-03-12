'use client'

export default function ContractorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <p className="text-slate-400 text-sm mb-4">
        Unable to load the contractor directory. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400"
      >
        Try again
      </button>
    </div>
  )
}
