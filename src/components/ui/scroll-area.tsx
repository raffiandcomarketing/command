'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both'
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'vertical', children, ...props }, ref) => {
    const scrollClasses = {
      vertical: 'overflow-y-auto overflow-x-hidden',
      horizontal: 'overflow-x-auto overflow-y-hidden',
      both: 'overflow-auto',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          scrollClasses[orientation],
          '[&::-webkit-scrollbar]:w-2',
          '[&::-webkit-scrollbar]:h-2',
          '[&::-webkit-scrollbar-track]:bg-gray-100',
          '[&::-webkit-scrollbar-track]:rounded-lg',
          '[&::-webkit-scrollbar-thumb]:bg-gray-300',
          '[&::-webkit-scrollbar-thumb]:rounded-lg',
          '[&::-webkit-scrollbar-thumb:hover]:bg-gray-400',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
