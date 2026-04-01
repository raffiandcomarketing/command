'use client'

import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DropdownItem {
  label: string
  value: string | number
  icon?: React.ReactNode
  disabled?: boolean
  divider?: boolean
}

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DropdownItem[]
  trigger: React.ReactNode
  onSelect?: (value: string | number) => void
  align?: 'left' | 'right'
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    { className, items, trigger, onSelect, align = 'left', ...props },
    ref
  ) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open])

    const handleSelect = (value: string | number) => {
      onSelect?.(value)
      setOpen(false)
    }

    return (
      <div
        ref={containerRef}
        className={cn('relative inline-block w-full', className)}
        {...props}
      >
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full inline-flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            'bg-white hover:bg-gray-50 text-gray-900',
            'border border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-[#09203F]'
          )}
        >
          {trigger}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div
            className={cn(
              'absolute top-full mt-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg z-50',
              align === 'right' && 'right-0',
              align === 'left' && 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  {item.divider ? (
                    <div className="my-1 h-px bg-gray-200" />
                  ) : (
                    <button
                      onClick={() => handleSelect(item.value)}
                      disabled={item.disabled}
                      className={cn(
                        'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                        item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {item.icon && item.icon}
                      {item.label}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Dropdown.displayName = 'Dropdown'

export { Dropdown }
export type { DropdownItem }
