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

/** Indent that aligns content under the title (icon size 16px + gap 8px). */
const CONTENT_INDENT = 'pl-6'

/**
 * Modular AuthAlert built on top of shadcn UI Alert.
 *
 * Layout (per design spec):
 * - Row 1: icon + title on the left, close button on the far right.
 * - Row 2: description on its own full-width line, indented to align
 *   with the title text — so long messages wrap across the whole alert
 *   width instead of being squeezed into a narrow column on mobile.
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
        // Own vertical layout instead of the base grid, so the description
        // gets the full alert width (the base grid reserves pr-18 for an
        // absolute close button and squeezes wrapped text on phones).
        'flex flex-col gap-1.5 pr-3 animate-in fade-in zoom-in-95 duration-200 transition-all',
        currentStyle.container,
        className,
      )}
    >
      {/* Row 1: icon + title, close button far right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {displayIcon}
          <AlertTitle className={cn('truncate font-semibold leading-tight text-sm', currentStyle.title)}>
            {displayTitle}
          </AlertTitle>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded p-1 text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Row 2: full-width description, aligned with the title text */}
      <AlertDescription className={cn('text-sm leading-snug', CONTENT_INDENT, currentStyle.text)}>
        {message}
      </AlertDescription>
    </Alert>
  )
}
