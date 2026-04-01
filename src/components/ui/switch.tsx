'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div className={cn(
            'w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#09203F] rounded-full',
            'peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-0.5 after:left-[2px]',
            'after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
            'peer-checked:bg-[#09203F]',
            'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
            className
          )} />
        </label>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
