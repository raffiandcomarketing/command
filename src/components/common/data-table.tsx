'use client'

import React, { forwardRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ChevronUp, ChevronDown, Database } from 'lucide-react'

export interface Column<T> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T extends Record<string, any>> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[]
  data: T[]
  rowKey?: keyof T | ((row: T) => string)
  onRowClick?: (row: T) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  loading?: boolean
  emptyMessage?: string
  pagination?: {
    pageSize: number
    currentPage: number
    onPageChange: (page: number) => void
    total?: number
  }
  striped?: boolean
  hoverable?: boolean
}

const DataTable = forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      className,
      columns,
      data,
      rowKey = 'id',
      onRowClick,
      sortBy: initialSortBy,
      sortOrder: initialSortOrder = 'asc',
      loading = false,
      emptyMessage = 'No data available',
      pagination,
      striped = true,
      hoverable = true,
      ...props
    },
    ref
  ) => {
    const [sortBy, setSortBy] = useState(initialSortBy || '')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

    const sortedData = useMemo(() => {
      let sorted = [...data]

      if (sortBy) {
        sorted.sort((a, b) => {
          const aValue = typeof a[sortBy] === 'function' ? a[sortBy]() : a[sortBy]
          const bValue = typeof b[sortBy] === 'function' ? b[sortBy]() : b[sortBy]

          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
          return 0
        })
      }

      if (pagination) {
        const start = (pagination.currentPage - 1) * pagination.pageSize
        return sorted.slice(start, start + pagination.pageSize)
      }

      return sorted
    }, [data, sortBy, sortOrder, pagination])

    const handleSort = (columnId: string) => {
      if (sortBy === columnId) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        setSortBy(columnId)
        setSortOrder('asc')
      }
    }

    const getRowKey = (row: any) => {
      return typeof rowKey === 'function' ? rowKey(row) : row[rowKey]
    }

    if (loading || data.length === 0) {
      return (
        <div ref={ref} className={cn('', className)} {...props}>
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Database />}
              title={emptyMessage}
              description="No records match your criteria"
            />
          )}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        <Table>
          <TableHeader>
            <TableRow isHeader>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className={cn(
                    'cursor-pointer select-none hover:bg-gray-100 transition-colors',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && sortBy === column.id && (
                      <span>
                        {sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow
                key={getRowKey(row)}
                className={cn(
                  striped && index % 2 === 0 && 'bg-gray-50',
                  hoverable && onRowClick && 'cursor-pointer hover:bg-gray-100'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : row[column.accessor]

                  return (
                    <TableCell
                      key={`${getRowKey(row)}-${column.id}`}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render ? column.render(value, row) : value}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-white rounded-b-lg">
            <span className="text-xs text-gray-600">
              Page {pagination.currentPage} of{' '}
              {Math.ceil((pagination.total || 0) / pagination.pageSize)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={
                  pagination.total
                    ? pagination.currentPage >=
                      Math.ceil(pagination.total / pagination.pageSize)
                    : false
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'

export { DataTable }
