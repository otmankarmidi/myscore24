interface AdPlaceholderProps {
  variant?: 'banner' | 'sidebar' | 'inline'
  label?: string
}

export default function AdvertisementPlaceholder({ variant = 'banner', label = 'Advertisement' }: AdPlaceholderProps) {
  const styles = {
    banner:  'w-full h-20 md:h-24',
    sidebar: 'w-full h-60',
    inline:  'w-full h-16',
  }

  return (
    <div
      className={`${styles[variant]} bg-surface-container-low rounded flex flex-col items-center justify-center gap-1 border border-surface-bright/20 relative overflow-hidden`}
      aria-label="Advertisement placeholder"
      role="complementary"
    >
      <span className="font-geist text-[9px] font-bold uppercase tracking-widest text-outline">{label}</span>
      <span className="font-inter text-[11px] text-on-surface-variant/50">Ad space — 728×90</span>
      {/* Decorative glow */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-primary-container/5 blur-xl pointer-events-none" />
    </div>
  )
}
