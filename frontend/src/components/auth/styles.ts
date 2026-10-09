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
    padding: '24px 16px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '32px',
    letterSpacing: '-0.02em',
  },
  footer: {
    marginTop: '24px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '12px 16px',
    '@media (max-width: 640px)': {
      position: 'sticky',
      bottom: 0,
      width: '100%',
      marginTop: 'auto',
      background: 'rgba(18,19,24,0.98)',
      backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    },
  },
  dot: {
    color: 'rgba(255,255,255,0.25)',
  },
} as const
