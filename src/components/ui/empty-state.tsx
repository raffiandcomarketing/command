'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      actionLabel,
      onAction,
      actionIcon,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-6 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 p-3 rounded-full bg-gray-100">
            <div className="text-gray-400 text-3xl">{icon}</div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            {description}
          </p>
        )}

        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
            icon={actionIcon}
            iconPosition={actionIcon ? 'left' : 'right'}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

export { EmptyState }
