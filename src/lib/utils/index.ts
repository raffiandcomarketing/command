import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  formatDistance,
  formatRelative,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns';
import { TaskPriority, AlertSeverity } from '@/types';
import { randomUUID } from 'crypto';

// ==================== CLASSNAME UTILITIES ====================

/**
 * Merge Tailwind classes with clsx utility
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ==================== DATE/TIME UTILITIES ====================

/**
 * Format a date to a readable string (e.g., "Mar 31, 2026")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format a date with time (e.g., "Mar 31, 2026 2:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy h:mm a');
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }

  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format as relative date (friendly format)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, new Date());
}

// ==================== STRING UTILITIES ====================

/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

/**
 * Extract initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a unique ID (UUID v4)
 */
export function generateId(): string {
  return randomUUID();
}

// ==================== CURRENCY UTILITIES ====================

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a large number with K, M, B notation
 */
export function formatCompactNumber(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }

  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }

  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }

  return num.toString();
}

/**
 * Format a number as percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return (value * 100).toFixed(decimals) + '%';
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Sleep/delay for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Classify task priority to a color class
 */
export function classifyPriority(priority: TaskPriority): string {
  const priorityColorMap: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'bg-blue-100 text-blue-800 border-blue-300',
    [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300',
    [TaskPriority.URGENT]: 'bg-red-100 text-red-800 border-red-300',
    [TaskPriority.CRITICAL]: 'bg-red-200 text-red-900 border-red-400',
  };

  return priorityColorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
}

/**
 * Classify alert severity to a color class
 */
export function classifySeverity(severity: AlertSeverity): string {
  const severityColorMap: Record<AlertSeverity, string> = {
    [AlertSeverity.LOW]: 'bg-blue-100 text-blue-800 border-blue-300',
    [AlertSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [AlertSeverity.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300',
    [AlertSeverity.CRITICAL]: 'bg-red-200 text-red-900 border-red-400',
  };

  return severityColorMap[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Check if an email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ==================== OBJECT UTILITIES ====================

/**
 * Deeply merge two objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// ==================== ARRAY UTILITIES ====================

/**
 * Chunk an array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array items by a key
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string | number, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string | number, T[]>
  );
}
