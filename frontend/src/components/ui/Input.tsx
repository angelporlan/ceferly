import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-slateText-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slateText-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            input-playful
            ${leftIcon ? 'pl-11' : ''}
            ${error ? '!border-coral focus:!ring-coral/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-bold text-coral">{error}</span>}
      {helperText && !error && (
        <span className="text-xs font-medium text-slateText-muted">{helperText}</span>
      )}
    </div>
  )
}
