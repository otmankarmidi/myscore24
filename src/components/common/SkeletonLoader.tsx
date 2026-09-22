export function SkeletonMatchRow() {
  return (
    <div className="p-2 flex items-center gap-2 animate-fade-in">
      <div className="skeleton w-12 h-8 shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-full shrink-0" />
          <div className="skeleton h-3.5 flex-1 max-w-[140px]" />
          <div className="skeleton w-5 h-5 ml-auto" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-full shrink-0" />
          <div className="skeleton h-3.5 flex-1 max-w-[120px]" />
          <div className="skeleton w-5 h-5 ml-auto" />
        </div>
      </div>
      <div className="skeleton w-7 h-7 shrink-0" />
    </div>
  )
}

export function SkeletonCompetitionGroup() {
  return (
    <div className="bg-surface-container-low rounded overflow-hidden shadow-sm">
      <div className="h-8 bg-surface-container flex items-center px-3 gap-2">
        <div className="skeleton w-20 h-3" />
      </div>
      <div className="flex flex-col divide-y divide-surface-bright/20">
        {[0, 1, 2].map(i => <SkeletonMatchRow key={i} />)}
      </div>
    </div>
  )
}

export function SkeletonStandingsRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="skeleton w-4 h-3 shrink-0" />
      <div className="skeleton w-4 h-4 rounded-full shrink-0" />
      <div className="skeleton h-3 flex-1 max-w-[120px]" />
      <div className="skeleton w-6 h-3 ml-auto" />
      <div className="skeleton w-6 h-3" />
      <div className="skeleton w-6 h-3" />
      <div className="skeleton w-6 h-3" />
      <div className="skeleton w-8 h-3" />
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
