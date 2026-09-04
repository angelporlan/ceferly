import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  selected?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  selected = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  }

  const selectedStyles = selected
    ? '!border-mint !bg-mint-50 shadow-[0_4px_0_#10B981]'
    : ''

  return (
    <div
      className={`
        ${interactive ? 'card-playful-interactive' : 'card-playful'}
        ${paddingStyles[padding]}
        ${selectedStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
