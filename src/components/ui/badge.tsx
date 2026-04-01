'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-700 border border-gray-300',
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border border-amber-200',
      danger: 'bg-red-50 text-red-700 border border-red-200',
      info: 'bg-blue-50 text-blue-700 border border-blue-200',
      outline: 'bg-white border border-gray-300 text-gray-600',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
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
