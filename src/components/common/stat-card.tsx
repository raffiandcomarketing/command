'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
    period?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  layout?: 'vertical' | 'horizontal'
}

const variantConfig = {
  default: 'text-[#09203F]',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      icon,
      trend,
      variant = 'default',
      layout = 'vertical',
      ...props
    },
    ref
  ) => {
    const isHorizontal = layout === 'horizontal'

    return (
      <Card
        ref={ref}
        className={cn('overflow-hidden', className)}
        {...props}
      >
        <CardContent className={cn(
          'p-6',
          isHorizontal && 'flex items-center justify-between gap-4'
        )}>
          <div className={cn(isHorizontal && 'flex-1')}>
            <p className="text-sm font-medium text-gray-500 mb-2">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn(
                'text-3xl font-bold',
                variantConfig[variant]
              )}>
                {value}
              </h3>
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded',
                  trend.direction === 'up' && 'text-emerald-700 bg-emerald-50',
                  trend.direction === 'down' && 'text-red-700 bg-red-50',
                  trend.direction === 'neutral' && 'text-gray-600 bg-gray-100'
                )}>
                  {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                  {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
                  <span>{trend.percentage}%</span>
                  {trend.period && <span className="text-gray-500">{trend.period}</span>}
                </div>
              )}
            </div>
          </div>

          {icon && (
            <div className={cn(
              'p-3 rounded-lg',
              'bg-gray-100',
              variantConfig[variant],
              isHorizontal && 'flex-shrink-0'
            )}>
              {icon}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
