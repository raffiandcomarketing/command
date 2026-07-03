'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-stone-100 text-stone-600 border border-stone-200',
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
      warning: 'bg-amber-50 text-amber-700 border border-amber-200/70',
      danger: 'bg-red-50 text-red-700 border border-red-200/70',
      info: 'bg-blue-50 text-blue-700 border border-blue-200/70',
      outline: 'bg-white/60 border border-stone-200 text-stone-600',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
