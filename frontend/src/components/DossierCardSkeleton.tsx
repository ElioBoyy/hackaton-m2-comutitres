function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
}

export function DossierCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-100 px-5 py-3" style={{ background: 'linear-gradient(to right, #f0f4ff, #eef2fb)' }}>
        <Bone className="h-6 w-20 rounded-full" />
        <Bone className="h-4 w-44" />
      </div>

      {/* Body */}
      <div className="flex gap-6 p-5">
        {/* Navigo card */}
        <Bone className="h-36 w-24 shrink-0 rounded-xl" />

        {/* Middle */}
        <div className="flex flex-1 flex-col gap-3 pt-1">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-32" />
          <Bone className="h-4 w-28" />

          <div className="mt-1">
            <Bone className="mb-2 h-3 w-24" />
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Bone className="h-7 w-7 rounded-full" />
                  <Bone className="h-2.5 w-8" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Bone className="mb-2 h-3 w-24" />
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Bone key={i} className="h-7 w-7 rounded-lg" />
              ))}
              <Bone className="ml-1.5 h-4 w-20 self-center" />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex w-56 shrink-0 flex-col gap-4 pt-1">
          <div className="flex gap-2.5">
            <Bone className="h-4 w-4 shrink-0 rounded" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Bone className="h-3 w-28" />
              <Bone className="h-4 w-36" />
            </div>
          </div>
          <div className="flex gap-2.5">
            <Bone className="h-4 w-4 shrink-0 rounded" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Bone className="h-3 w-32" />
              <Bone className="h-4 w-20" />
            </div>
          </div>
          <div className="flex gap-2.5">
            <Bone className="h-4 w-4 shrink-0 rounded" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Bone className="h-3 w-12" />
              <Bone className="h-4 w-24" />
            </div>
          </div>
          <Bone className="mt-auto h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Footer */}
      <div className="h-11 border-t border-blue-100" style={{ background: '#eef4fd' }} />
    </div>
  )
}
