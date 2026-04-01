'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KPIGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  current: number
  target: number
  unit?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  showPercentage?: boolean
  animated?: boolean
}

const KPIGauge = forwardRef<HTMLDivElement, KPIGaugeProps>(
  (
    {
      className,
      label,
      current,
      target,
      unit = '',
      variant = 'default',
      showPercentage = true,
      animated = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min((current / target) * 100, 100)
    const isSuccess = percentage >= 100
    const isWarning = percentage >= 75 && percentage < 100
    const isDanger = percentage < 75

    let finalVariant = variant
    if (variant === 'default') {
      if (isSuccess) finalVariant = 'success'
      else if (isWarning) finalVariant = 'warning'
      else finalVariant = 'danger'
    }

    const variantColors = {
      default: 'bg-[#09203F]',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
    }

    return (
      <Card ref={ref} className={cn('overflow-hidden', className)} {...props}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-900">{label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {current.toFixed(1)}{unit}
              </span>
              <span className="text-xs text-gray-500">
                Target: {target}{unit}
              </span>
            </div>

            {showPercentage && (
              <span className="text-xs font-medium text-gray-500">
                {percentage.toFixed(0)}% of target
              </span>
            )}
          </div>

          <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                variantColors[finalVariant],
                animated && 'animate-pulse-subtle'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Progress</p>
              <p className="text-sm font-semibold text-gray-900">
                {percentage.toFixed(1)}%
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className="text-sm font-semibold text-gray-900">
                {Math.max(target - current, 0).toFixed(1)}{unit}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

KPIGauge.displayName = 'KPIGauge'

export { KPIGauge }
