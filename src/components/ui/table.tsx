'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table
        ref={ref}
        className={cn('w-full text-sm', className)}
        {...props}
      />
    </div>
  )
)

Table.displayName = 'Table'

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-gray-50 border-b border-gray-200', className)}
      {...props}
    />
  )
)

TableHeader.displayName = 'TableHeader'

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-gray-100', className)} {...props} />
  )
)

TableBody.displayName = 'TableBody'

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('bg-gray-50 border-t border-gray-200', className)}
      {...props}
    />
  )
)

TableFooter.displayName = 'TableFooter'

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isHeader?: boolean
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, isHeader, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        !isHeader && 'hover:bg-gray-50',
        className
      )}
      {...props}
    />
  )
)

TableRow.displayName = 'TableRow'

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap',
        className
      )}
      {...props}
    />
  )
)

TableHead.displayName = 'TableHead'

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-4 py-3 text-gray-700', className)}
      {...props}
    />
  )
)

TableCell.displayName = 'TableCell'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
}
