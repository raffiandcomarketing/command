'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors duration-200',
            'focus:outline-none focus:border-[#09203F] focus:ring-1 focus:ring-[#09203F]/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-vertical min-h-24',
            error && 'border-red-600 focus:border-red-600 focus:ring-red-600/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
