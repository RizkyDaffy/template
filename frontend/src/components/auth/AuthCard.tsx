import React from 'react'
import { cn } from '@/lib/utils'
import { authCardBaseStyle } from './styles'

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: number | string
}

/**
 * Reusable AuthCard component for login, reset password, and other auth/account pages.
 * Ensures strict UI consistency across card dimensions, borders, backgrounds, and padding.
 */
export function AuthCard({
  children,
  maxWidth = '375px',
  className,
  style,
  ...props
}: AuthCardProps) {
  return (
    <div
      style={{
        ...authCardBaseStyle,
        maxWidth,
        ...style,
      }}
      className={cn('auth-card transition-all duration-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}
