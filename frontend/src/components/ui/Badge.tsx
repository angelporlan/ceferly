import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'mint' | 'amber' | 'sky' | 'coral' | 'amethyst' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'mint',
  icon,
  className = '',
}) => {
  const variantStyles = {
    mint: 'bg-mint-light text-mint-dark border border-mint/30',
    amber: 'bg-amber-light text-amber-dark border border-amber/30',
    sky: 'bg-sky-light text-sky-dark border border-sky/30',
    coral: 'bg-coral-light text-coral-dark border border-coral/30',
    amethyst: 'bg-amethyst-light text-amethyst-dark border border-amethyst/30',
    neutral: 'bg-slate-100 text-slateText-muted border border-slate-200',
  }

  return (
    <span className={`badge-pill ${variantStyles[variant]} ${className}`}>
      {icon && <span className="inline-flex items-center text-sm">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
