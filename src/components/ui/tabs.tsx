'use client'

import React, { forwardRef, useState, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component')
  }
  return context
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, defaultValue = '', value, onValueChange, children, ...props },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const actualValue = value !== undefined ? value : internalValue

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider value={{ value: actualValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn('', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex border-b border-gray-200 bg-white rounded-t-lg',
        className
      )}
      {...props}
    />
  )
)

TabList.displayName = 'TabList'

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabs()
    const isActive = activeValue === value

    return (
      <button
        ref={ref}
        onClick={() => onValueChange(value)}
        className={cn(
          'px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
          isActive
            ? 'border-b-[#09203F] text-[#09203F]'
            : 'border-b-transparent text-gray-500 hover:text-gray-700',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Tab.displayName = 'Tab'

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue } = useTabs()

    if (activeValue !== value) return null

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

TabPanel.displayName = 'TabPanel'

export { Tabs, TabList, Tab, TabPanel }
