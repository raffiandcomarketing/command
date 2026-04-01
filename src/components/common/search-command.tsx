'use client'

import React, { forwardRef, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CommandItem {
  id: string
  title: string
  description?: string
  category?: string
  icon?: React.ReactNode
  onSelect: () => void
}

interface SearchCommandProps extends React.HTMLAttributes<HTMLDivElement> {
  items: CommandItem[]
  placeholder?: string
  onSearch?: (query: string) => void
  maxResults?: number
  groupByCategory?: boolean
}

const SearchCommand = forwardRef<HTMLDivElement, SearchCommandProps>(
  (
    {
      className,
      items,
      placeholder = 'Search commands... (Cmd+K)',
      onSearch,
      maxResults = 10,
      groupByCategory = true,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const filteredItems = items
      .filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, maxResults)

    const groupedItems = groupByCategory
      ? filteredItems.reduce((acc, item) => {
          const category = item.category || 'Other'
          if (!acc[category]) acc[category] = []
          acc[category].push(item)
          return acc
        }, {} as Record<string, CommandItem[]>)
      : { results: filteredItems }

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          setOpen(!open)
          setTimeout(() => inputRef.current?.focus(), 0)
        }

        if (!open) return

        switch (e.key) {
          case 'Escape':
            setOpen(false)
            break
          case 'ArrowDown':
            e.preventDefault()
            setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
            break
          case 'ArrowUp':
            e.preventDefault()
            setSelectedIndex((prev) =>
              prev === 0 ? filteredItems.length - 1 : prev - 1
            )
            break
          case 'Enter':
            e.preventDefault()
            if (filteredItems[selectedIndex]) {
              filteredItems[selectedIndex].onSelect()
              setOpen(false)
              setQuery('')
            }
            break
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, filteredItems, selectedIndex])

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

    return (
      <div
        ref={containerRef}
        className={cn('relative w-full', className)}
        {...props}
      >
        <div
          className="cursor-pointer"
          onClick={() => {
            setOpen(!open)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch?.(e.target.value)
              setSelectedIndex(0)
            }}
            icon={<Search className="h-4 w-4" />}
            className={cn(!open && 'cursor-pointer')}
            onClick={() => setOpen(true)}
          />
        </div>

        {open && filteredItems.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                {category !== 'results' && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    {category}
                  </div>
                )}
                {categoryItems.map((item, index) => {
                  const globalIndex = filteredItems.indexOf(item)
                  const isSelected = globalIndex === selectedIndex

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.onSelect()
                        setOpen(false)
                        setQuery('')
                      }}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                      )}
                    >
                      {item.icon && (
                        <div className="mt-0.5 flex-shrink-0 text-gray-400">
                          {item.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {open && query && filteredItems.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 p-8">
            <p className="text-center text-gray-500 text-sm">
              No results found for "{query}"
            </p>
          </div>
        )}
      </div>
    )
  }
)

SearchCommand.displayName = 'SearchCommand'

export { SearchCommand }
export type { CommandItem }
