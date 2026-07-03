'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  /** Render the (single) child element directly, merging button styling. */
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-[#0A2245] text-white hover:bg-[#0E2C55] font-medium shadow-luxe hover:shadow-luxe-md disabled:opacity-50 disabled:cursor-not-allowed',
      secondary:
        'bg-stone-100 text-stone-800 hover:bg-stone-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed',
      outline:
        'border border-stone-300 bg-white hover:border-gold-400 hover:bg-gold-50/60 text-stone-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed',
      ghost:
        'bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed',
      destructive:
        'bg-red-700 hover:bg-red-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-4 py-2 text-base rounded-lg gap-2',
      lg: 'px-6 py-3 text-lg rounded-lg gap-2.5',
    }

    const composedClassName = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-100',
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>
      return React.cloneElement(child, {
        className: cn(composedClassName, child.props.className),
      })
    }

    return (
      <button
        ref={ref}
        className={composedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
