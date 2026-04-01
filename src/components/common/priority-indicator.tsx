'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, Flag, Zap, Radio } from 'lucide-react'

type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'

interface PriorityIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  priority: PriorityLevel
  showLabel?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const priorityConfig: Record<PriorityLevel, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  LOW: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    label: 'Low',
    icon: <Radio className="h-4 w-4" />,
  },
  MEDIUM: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    label: 'Medium',
    icon: <Flag className="h-4 w-4" />,
  },
  HIGH: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    label: 'High',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  URGENT: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    label: 'Urgent',
    icon: <Zap className="h-4 w-4" />,
  },
  CRITICAL: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    label: 'Critical',
    icon: <AlertCircle className="h-4 w-4" />,
  },
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
}

const PriorityIndicator = forwardRef<HTMLDivElement, PriorityIndicatorProps>(
  (
    {
      className,
      priority,
      showLabel = true,
      showIcon = true,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const config = priorityConfig[priority]

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all border',
          config.bgColor,
          config.color,
          'border-current/20',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showIcon && config.icon}
        {showLabel && <span>{config.label}</span>}
      </div>
    )
  }
)

PriorityIndicator.displayName = 'PriorityIndicator'

export { PriorityIndicator }
export type { PriorityLevel }
