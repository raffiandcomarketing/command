'use client'

import React, { forwardRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean
  onOpenChange: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  title?: string
  description?: string
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      onOpenChange,
      size = 'md',
      title,
      description,
      showCloseButton = true,
      children,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            ref={ref}
            className={cn(
              'w-full rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden',
              sizeClasses[size],
              className
            )}
            {...props}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <div>
                  {title && (
                    <h2 className="text-xl font-semibold text-gray-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export { Modal }
