export function SkeletonMatchRow() {
  return (
    <div className="p-3 flex items-center justify-between gap-3 h-[52px] animate-pulse bg-white dark:bg-[#0c121e]">
      {/* Status column */}
      <div className="w-16 shrink-0 flex flex-col items-center justify-center">
        <div className="w-12 h-5 rounded-md bg-[#EEEEEE] dark:bg-slate-800" />
      </div>

      {/* Teams & scores */}
      <div className="flex-1 flex flex-col min-w-0 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-4 h-4 rounded-full bg-[#E5E5E5] dark:bg-slate-700 shrink-0" />
            <div className="h-3.5 w-28 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
          </div>
          <div className="w-4 h-3.5 bg-[#EEEEEE] dark:bg-slate-800 rounded shrink-0" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-4 h-4 rounded-full bg-[#E5E5E5] dark:bg-slate-700 shrink-0" />
            <div className="h-3.5 w-24 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
          </div>
          <div className="w-4 h-3.5 bg-[#EEEEEE] dark:bg-slate-800 rounded shrink-0" />
        </div>
      </div>

      {/* Favorite */}
      <div className="w-6 shrink-0 flex items-center justify-end">
        <div className="w-4 h-4 rounded-full bg-[#EEEEEE] dark:bg-slate-800" />
      </div>
    </div>
  )
}

export function SkeletonCompetitionGroup() {
  return (
    <div className="bg-white dark:bg-[#0c121e] rounded-xl border border-[#E5E5E5] dark:border-[#182335] overflow-hidden shadow-xs divide-y divide-[#E5E5E5] dark:divide-[#182335]">
      <div className="h-10 bg-[#FAFAFA] dark:bg-[#101826] px-3.5 flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#182335]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#E5E5E5] dark:bg-slate-700" />
          <div className="w-36 h-3.5 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
        </div>
        <div className="w-16 h-3 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
      </div>
      <div className="flex flex-col divide-y divide-[#F5F5F5] dark:divide-[#141e30]">
        {[0, 1, 2].map(i => <SkeletonMatchRow key={i} />)}
      </div>
    </div>
  )
}

export function SkeletonStandingsRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 h-10 animate-pulse">
      <div className="w-4 h-3 bg-[#EEEEEE] dark:bg-slate-800 shrink-0 rounded" />
      <div className="w-4 h-4 rounded-full bg-[#E5E5E5] dark:bg-slate-700 shrink-0" />
      <div className="h-3 flex-1 max-w-[120px] bg-[#EEEEEE] dark:bg-slate-800 rounded" />
      <div className="w-6 h-3 ml-auto bg-[#EEEEEE] dark:bg-slate-800 rounded" />
      <div className="w-6 h-3 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
      <div className="w-6 h-3 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
      <div className="w-6 h-3 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
      <div className="w-8 h-3 bg-[#EEEEEE] dark:bg-slate-800 rounded" />
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
