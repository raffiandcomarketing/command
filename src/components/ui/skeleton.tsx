'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-gray-200 rounded-lg animate-pulse',
        className
      )}
      {...props}
    />
  )
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
