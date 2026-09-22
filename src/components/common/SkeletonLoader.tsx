export function SkeletonMatchRow() {
  return (
    <div className="p-2 flex items-center justify-between gap-2 h-[48px] animate-pulse">
      {/* Status column */}
      <div className="w-14 shrink-0 flex flex-col gap-1">
        <div className="skeleton w-12 h-5 rounded bg-surface-container-high" />
      </div>

      {/* Teams & scores */}
      <div className="flex-1 flex flex-col min-w-0 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="skeleton w-4 h-4 rounded-full bg-surface-container-high shrink-0" />
            <div className="skeleton h-4 w-28 bg-surface-container-high rounded" />
          </div>
          <div className="skeleton w-5 h-4 bg-surface-container-high rounded shrink-0" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="skeleton w-4 h-4 rounded-full bg-surface-container-high shrink-0" />
            <div className="skeleton h-4 w-24 bg-surface-container-high rounded" />
          </div>
          <div className="skeleton w-5 h-4 bg-surface-container-high rounded shrink-0" />
        </div>
      </div>

      {/* Favorite */}
      <div className="w-8 shrink-0 flex items-center justify-end">
        <div className="skeleton w-5 h-5 rounded-full bg-surface-container-high" />
      </div>
    </div>
  )
}

export function SkeletonCompetitionGroup() {
  return (
    <div className="bg-surface-container-low rounded overflow-hidden shadow-sm">
      <div className="h-8 bg-surface-container px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-full bg-surface-container-high" />
          <div className="skeleton w-36 h-3 bg-surface-container-high rounded" />
        </div>
      </div>
      <div className="flex flex-col divide-y divide-surface-bright/20">
        {[0, 1, 2].map(i => <SkeletonMatchRow key={i} />)}
      </div>
    </div>
  )
}

export function SkeletonStandingsRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 h-9">
      <div className="skeleton w-4 h-3 bg-surface-container-high shrink-0 rounded" />
      <div className="skeleton w-4 h-4 rounded-full bg-surface-container-high shrink-0" />
      <div className="skeleton h-3 flex-1 max-w-[120px] bg-surface-container-high rounded" />
      <div className="skeleton w-6 h-3 ml-auto bg-surface-container-high rounded" />
      <div className="skeleton w-6 h-3 bg-surface-container-high rounded" />
      <div className="skeleton w-6 h-3 bg-surface-container-high rounded" />
      <div className="skeleton w-6 h-3 bg-surface-container-high rounded" />
      <div className="skeleton w-8 h-3 bg-surface-container-high rounded" />
    </div>
  )
}

export default function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCompetitionGroup key={i} />
      ))}
    </div>
  )
}
