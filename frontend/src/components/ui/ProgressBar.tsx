import React from 'react'

export interface ProgressBarProps {
  value: number
  max?: number
  color?: 'mint' | 'amber' | 'sky' | 'amethyst'
  showLabel?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'mint',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const colorStyles = {
    mint: 'bg-mint shadow-[0_2px_0_#047857]',
    amber: 'bg-amber shadow-[0_2px_0_#B45309]',
    sky: 'bg-sky shadow-[0_2px_0_#0369A1]',
    amethyst: 'bg-amethyst shadow-[0_2px_0_#6D28D9]',
  }

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-slate-200 h-3.5 rounded-pill overflow-hidden p-0.5 border border-slate-300">
        <div
          className={`h-full rounded-pill transition-all duration-300 ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-black text-slateText-muted whitespace-nowrap">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
