import { Container, CssBaseline, Typography } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { ConfigProvider } from 'antd'
import React from 'react'
import { FONT_FAMILY, muiTheme } from '@/theme'
import { AuthFooter } from './AuthFooter'
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
              paddingY: 2,
              // reserve space so fixed footer never covers the last element
              paddingBottom: { xs: '72px', sm: '64px' },
              boxSizing: 'border-box',
            }}
          >
            <Typography sx={authLayoutStyles.title}>{title}</Typography>

            {children}

            {helpContent}
          </Container>
          <AuthFooter />
        </div>
      </ConfigProvider>
    </ThemeProvider>
  )
}
