import React from 'react'
import { FONT_FAMILY } from '@/theme'

export const authCardBaseStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '375px',
  background: '#1a1b1f',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'none',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxSizing: 'border-box',
}

export const authFormStyles = {
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  asterisk: {
    color: '#ef4444',
    marginLeft: '4px',
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: '#0f1013',
      color: '#fff',
      height: '48px',
      fontSize: '14px',
      '& fieldset': {
        borderColor: 'rgba(255,255,255,0.12)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255,255,255,0.2)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'rgba(99,102,241,0.8)',
        boxShadow: '0 0 0 4px rgba(99,102,241,0.15)',
      },
      '& input::placeholder': {
        color: 'rgba(255,255,255,0.4)',
        opacity: 1,
      },
      '& .MuiInputBase-input.Mui-disabled': {
        color: '#636363',
        WebkitTextFillColor: '#636363',
      },
      // Block WebKit/Chrome autofill styling (Gboard / Google credential manager
      // fills the input with an opaque light background). An inset box-shadow
      // paints over it since `background-color` alone is ignored on autofill.
      // `!important` is required: Chrome's UA stylesheet forces its own values
      // on :autofill and only !important beats them. BOTH pseudo-classes are
      // targeted: modern Chrome Android styles autofill via the standard
      // `:autofill`, older via `:-webkit-autofill` — missing either makes the
      // autofilled text render black. `color-scheme: dark` stops UA-internal
      // light/dark (light-dark()) colors from resolving to black.
      '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus, & .MuiInputBase-input:autofill:focus, & .MuiInputBase-input:-webkit-autofill:active, & .MuiInputBase-input:autofill:active': {
        WebkitTextFillColor: '#fff !important',
        color: '#fff !important',
        caretColor: '#fff !important',
        colorScheme: 'dark',
        boxShadow: '0 0 0 1000px #0f1013 inset',
        borderRadius: '10px',
        transition: 'background-color 9999s ease-in-out 0s',
      },
    },
  },
  primaryBtn: {
    height: '48px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    background: '#6366f1',
    border: 'none',
    boxShadow: 'none',
    '&:hover': {
      background: '#4f46e5',
    },
  },
  help: {
    marginTop: '16px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  helpLink: {
    color: '#fff',
    textDecoration: 'none',
  },
} as const

export const authLayoutStyles = {
  page: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#121318',
    color: '#fff',
    fontFamily: FONT_FAMILY,
    padding: '16px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1100, // t.zIndex.appBar
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: '#121318', // opaque, same as page
    boxSizing: 'border-box',
  },
  footerText: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  dot: {
    color: 'rgba(255,255,255,0.25)',
  },
} as const
