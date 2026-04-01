'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const variantClasses = {
      default: 'bg-[#09203F]',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
    }

    // Determine variant based on percentage if default
    let finalVariant = variant
    if (variant === 'default') {
      if (percentage < 33) finalVariant = 'danger'
      else if (percentage < 66) finalVariant = 'warning'
      else finalVariant = 'success'
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="flex items-center justify-between mb-2">
          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                variantClasses[finalVariant]
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {showLabel && (
            <span className="ml-3 text-sm font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
