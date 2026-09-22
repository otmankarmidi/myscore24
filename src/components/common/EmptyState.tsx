interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon = 'sports_soccer', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: 32 }}>{icon}</span>
      </div>
      <h3 className="font-geist font-semibold text-[16px] text-on-surface mb-2">{title}</h3>
      {description && (
        <p className="font-inter text-[13px] text-on-surface-variant max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high font-geist text-[12px] font-semibold text-on-surface transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
