'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayMs?: number
  children: React.ReactNode
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      className,
      content,
      side = 'top',
      delayMs = 200,
      children,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false)
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
      null
    )

    const handleMouseEnter = () => {
      const id = setTimeout(() => setVisible(true), delayMs)
      setTimeoutId(id)
    }

    const handleMouseLeave = () => {
      if (timeoutId) clearTimeout(timeoutId)
      setVisible(false)
    }

    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    }

    const arrowClasses = {
      top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
      right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
      left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    }

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}

        {visible && (
          <div
            className={cn(
              'absolute z-50 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none',
              positionClasses[side],
              className
            )}
          >
            {content}
            <div
              className={cn(
                'absolute w-2 h-2 bg-gray-900 rotate-45',
                arrowClasses[side]
              )}
            />
          </div>
        )}
      </div>
    )
  }
)

Tooltip.displayName = 'Tooltip'

export { Tooltip }
