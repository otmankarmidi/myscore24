'use client'

import { useState } from 'react'

export interface CommentaryItem {
  id: string
  minute: number
  extraMinute?: number
  type: 'goal' | 'card' | 'var' | 'sub' | 'comment' | 'whistle'
  text: string
  isImportant?: boolean
}

interface MatchCommentaryProps {
  commentary: CommentaryItem[]
}

function getCommentaryIcon(type: CommentaryItem['type']) {
  switch (type) {
    case 'goal':
      return { icon: 'sports_soccer', color: 'text-primary' }
    case 'card':
      return { icon: 'style', color: 'text-amber-400' }
    case 'var':
      return { icon: 'live_tv', color: 'text-purple-400' }
    case 'sub':
      return { icon: 'published_with_changes', color: 'text-sky-400' }
    case 'whistle':
      return { icon: 'sports', color: 'text-secondary' }
    default:
      return { icon: 'chat_bubble_outline', color: 'text-on-surface-variant' }
  }
}

export default function MatchCommentary({ commentary }: MatchCommentaryProps) {
  const [filter, setFilter] = useState<'all' | 'key'>('all')

  const items = filter === 'key' ? commentary.filter((c) => c.isImportant) : commentary

  return (
    <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden">
      <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Live Commentary</span>

        <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filter === 'all' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Events ({commentary.length})
          </button>
          <button
            onClick={() => setFilter('key')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filter === 'key' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Key Highlights
          </button>
        </div>
      </div>

      <div className="divide-y divide-surface-bright/60 max-h-[600px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant">No commentary entries available yet.</div>
        ) : (
          items.map((item) => {
            const { icon, color } = getCommentaryIcon(item.type)

            return (
              <div
                key={item.id}
                className={`p-3.5 flex gap-3.5 transition-colors ${
                  item.isImportant ? 'bg-surface-container-high/40 border-l-2 border-primary' : 'hover:bg-surface-container-high/20'
                }`}
              >
                {/* Minute badge */}
                <div className="shrink-0 flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono font-bold text-xs text-primary tabular-nums">
                    {item.minute}&apos;
                    {item.extraMinute ? `+${item.extraMinute}` : ''}
                  </span>
                </div>

                {/* Icon */}
                <span className={`material-symbols-outlined text-[20px] ${color} shrink-0 mt-0.5`}>
                  {icon}
                </span>

                {/* Text */}
                <p className={`text-body-sm leading-relaxed ${item.isImportant ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
                  {item.text}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
