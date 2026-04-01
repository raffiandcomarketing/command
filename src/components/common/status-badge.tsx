'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type StatusType = 'pending' | 'active' | 'completed' | 'failed' | 'on-hold' | 'cancelled' | 'draft' | 'approved' | 'rejected' | 'in_progress'

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType
  showIcon?: boolean
}

const statusConfig: Record<StatusType, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'; label: string; icon?: string }> = {
  pending: { variant: 'warning', label: 'Pending', icon: '⏳' },
  active: { variant: 'info', label: 'Active', icon: '🔵' },
  in_progress: { variant: 'info', label: 'In Progress', icon: '⚙️' },
  completed: { variant: 'success', label: 'Completed', icon: '✓' },
  failed: { variant: 'danger', label: 'Failed', icon: '✕' },
  'on-hold': { variant: 'warning', label: 'On Hold', icon: '⏸' },
  cancelled: { variant: 'danger', label: 'Cancelled', icon: '✕' },
  draft: { variant: 'outline', label: 'Draft', icon: '📝' },
  approved: { variant: 'success', label: 'Approved', icon: '✓' },
  rejected: { variant: 'danger', label: 'Rejected', icon: '✕' },
}

const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, showIcon = true, ...props }, ref) => {
    const config = statusConfig[status]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      >
        {showIcon && config.icon && <span>{config.icon}</span>}
        <span>{config.label}</span>
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

export { StatusBadge }
export type { StatusType }
