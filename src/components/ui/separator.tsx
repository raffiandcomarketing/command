'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    const isVertical = orientation === 'vertical'

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200',
          isVertical ? 'h-full w-px' : 'h-px w-full',
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
