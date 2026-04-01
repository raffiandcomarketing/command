'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, src, alt, initials, name, size = 'md', ...props },
    ref
  ) => {
    const [imageError, setImageError] = useState(false)

    const displayInitials =
      initials || (name ? getInitials(name) : 'U')

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[#09203F]/10 font-semibold text-[#09203F] overflow-hidden',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          displayInitials
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }
