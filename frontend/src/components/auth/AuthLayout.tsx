import { Container, CssBaseline, Typography } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { ConfigProvider } from 'antd'
import React from 'react'
import { FONT_FAMILY, muiTheme } from '@/theme'
import { authLayoutStyles } from './styles'

export interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  helpContent?: React.ReactNode
}

/**
 * Reusable AuthLayout providing consistent theme providers,
 * page centering, title position, and footer across all auth pages.
 */
export function AuthLayout({
  children,
  title = 'Digital Control System',
  helpContent,
}: AuthLayoutProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ConfigProvider
        theme={{
          token: {
            fontFamily: FONT_FAMILY,
            colorBgContainer: '#1a1b1f',
            colorText: '#fff',
          },
          components: {
            Divider: {
              colorSplit: 'rgba(255,255,255,0.12)',
            },
          },
        }}
      >
        <div style={authLayoutStyles.page}>
          <Container
            maxWidth={false}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography sx={authLayoutStyles.title}>{title}</Typography>

            {children}

            {helpContent}

            <div style={authLayoutStyles.footer}>
              <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2L3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-3zm0 2.18L19 6.58V11c0 4-2.9 8-7 9.16C7.9 19 5 15 5 11V6.58l7-2.4z"
                />
              </svg>
              RIZUU SOFTWARE
              <span style={authLayoutStyles.dot} className="desktop-only">•</span>
              <span className="desktop-only">Protected by End-to-End Enterprise Encryption</span>
              <span style={authLayoutStyles.dot}>•</span>
              Version 4.2.1
            </div>
          </Container>
        </div>
      </ConfigProvider>
    </ThemeProvider>
  )
}
