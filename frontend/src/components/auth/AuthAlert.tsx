import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'
import React from 'react'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { AuthAlertType } from './messages'

export interface AuthAlertProps {
  type?: AuthAlertType
  title?: string
  message: React.ReactNode
  onClose?: () => void
  className?: string
  icon?: React.ReactNode
}

const typeStyles: Record<
  AuthAlertType,
  { container: string; title: string; text: string; defaultTitle: string }
> = {
  success: {
    container: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-100',
    title: 'text-emerald-300',
    text: 'text-emerald-200/90',
    defaultTitle: 'Berhasil',
  },
  error: {
    container: 'border-rose-500/40 bg-rose-950/40 text-rose-100',
    title: 'text-rose-300',
    text: 'text-rose-200/90',
    defaultTitle: 'Terjadi Kesalahan',
  },
  warning: {
    container: 'border-amber-500/40 bg-amber-950/40 text-amber-100',
    title: 'text-amber-300',
    text: 'text-amber-200/90',
    defaultTitle: 'Peringatan',
  },
  info: {
    container: 'border-sky-500/40 bg-sky-950/40 text-sky-100',
    title: 'text-sky-300',
    text: 'text-sky-200/90',
    defaultTitle: 'Informasi',
  },
}

const defaultIcons: Record<AuthAlertType, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="size-4 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="size-4 text-amber-400 shrink-0" />,
  info: <Info className="size-4 text-sky-400 shrink-0" />,
}

/**
 * Modular AuthAlert built on top of shadcn UI Alert.
 * Provides consistent coloring, typography, icons, and dismissal across all auth pages.
 */
export function AuthAlert({
  type = 'info',
  title,
  message,
  onClose,
  className,
  icon,
}: AuthAlertProps) {
  const currentStyle = typeStyles[type]
  const displayTitle = title ?? currentStyle.defaultTitle
  const displayIcon = icon ?? defaultIcons[type]

  return (
    <Alert
      className={cn(
        'shadow-sm animate-in fade-in zoom-in-95 duration-200 transition-all',
        currentStyle.container,
        className,
      )}
    >
      {displayIcon}
      <div className="flex flex-col gap-0.5 pr-2">
        {displayTitle && (
          <AlertTitle className={cn('font-semibold leading-tight text-sm', currentStyle.title)}>
            {displayTitle}
          </AlertTitle>
        )}
        <AlertDescription className={cn('text-sm leading-snug', currentStyle.text)}>
          {message}
        </AlertDescription>
      </div>

      {onClose && (
        <AlertAction className="top-2 right-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded p-0.5 text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </AlertAction>
      )}
    </Alert>
  )
}
