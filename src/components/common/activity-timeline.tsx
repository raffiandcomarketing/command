'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

interface TimelineItem {
  id: string
  avatar?: string
  name?: string
  initials?: string
  description: string
  timestamp: Date | string
  icon?: React.ReactNode
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

interface ActivityTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[]
}

const colorConfig = {
  default: 'bg-gray-300',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
}

const ActivityTimeline = forwardRef<HTMLDivElement, ActivityTimelineProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center',
                colorConfig[item.color || 'default']
              )}>
                {item.avatar || item.initials ? (
                  <Avatar
                    src={item.avatar}
                    initials={item.initials}
                    name={item.name}
                    size="sm"
                  />
                ) : (
                  item.icon
                )}
              </div>
              {index !== items.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              )}
            </div>

            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-gray-900">
                {item.name && <span>{item.name}: </span>}
                <span className="text-gray-600">{item.description}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }
)

ActivityTimeline.displayName = 'ActivityTimeline'

export { ActivityTimeline }
export type { TimelineItem }
