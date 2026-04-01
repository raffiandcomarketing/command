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
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-[#09203F] text-white hover:bg-[#0d2a4f] font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed',
      outline:
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed',
      ghost:
        'bg-transparent hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed',
      destructive:
        'bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-4 py-2 text-base rounded-lg gap-2',
      lg: 'px-6 py-3 text-lg rounded-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#09203F] focus:ring-offset-2 focus:ring-offset-white',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
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
