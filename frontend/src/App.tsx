import {
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { Button as AntButton, ConfigProvider, Divider } from 'antd'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { FONT_FAMILY, muiTheme } from '@/theme'

const styles = {
  page: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#121318',
    color: '#fff',
    fontFamily: FONT_FAMILY,
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '32px',
    letterSpacing: '-0.02em',
  },
  card: {
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
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '6px',
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
  passwordRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  forgot: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'underline',
    },
  },
  loginBtn: {
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
  or: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    margin: '4px 0',
    '& .ant-divider-inner-text': {
      color: 'rgba(255,255,255,0.5)',
      padding: '0 12px',
    },
    '&::before, &::after': {
      borderColor: 'rgba(255,255,255,0.12)',
    },
  },
  googleBtn: {
    height: '48px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 500,
    background: 'transparent',
    borderColor: 'rgba(255,255,255,0.18)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    '&:hover': {
      background: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.28)',
      color: '#fff',
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
    '&:hover': {
      textDecoration: 'underline',
    },
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.32 0 6.26 1.15 8.6 3.38l6.44-6.44C34.44 2.56 29.58 0 24 0 14.64 0 6.48 5.48 2.64 13.44l7.44 5.78C12.52 13.14 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.16 24.56c0-1.68-.16-3.32-.48-4.88H24v9.28h12.56c-.56 2.96-2.24 5.48-4.8 7.16l7.4 5.76c4.32-3.98 6.8-9.84 6.8-17.32z"
    />
    <path
      fill="#FBBC05"
      d="M10.08 28.22c-.92-2.72-.92-5.72 0-8.44l-7.44-5.78C.72 17.4 0 20.6 0 24s.72 6.6 2.64 9.98l7.44-5.76z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.92-2.16 15.88-5.84l-7.4-5.76c-2.08 1.4-4.72 2.2-8.48 2.2-6.3 0-11.48-3.64-13.92-8.78l-7.44 5.76C6.48 42.52 14.64 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
)

function App() {
  const [showPassword, setShowPassword] = useState(false)

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
        <div style={styles.page}>
          <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={styles.title}>Digital Control System</Typography>
            <div style={styles.card}>
              <div>
                <Typography sx={styles.label}>
                  Work.ID
                  <span style={styles.asterisk}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your work ID"
                  sx={styles.input}
                  slotProps={{ input: { autoComplete: 'username' } }}
                />
              </div>
              <div>
                <div style={styles.passwordRow}>
                  <Typography sx={styles.label}>
                    Password
                    <span style={styles.asterisk}>*</span>
                  </Typography>
                  <a href="#" style={styles.forgot} onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>
                </div>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  sx={styles.input}
                  slotProps={{
                    input: {
                      autoComplete: 'current-password',
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>
              <AntButton type="primary" style={styles.loginBtn}>
                Login
              </AntButton>
              <Divider style={styles.or}>OR</Divider>
              <AntButton style={styles.googleBtn}>
                <GoogleIcon />
                Sign in with Google
              </AntButton>
            </div>
            <Typography sx={styles.help}>
              Need assistance signing in?{' '}
              <a href="#" style={styles.helpLink} onClick={(e) => e.preventDefault()}>
                Contact IT Support
              </a>
            </Typography>
            <div style={styles.footer}>
              <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2L3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-3zm0 2.18L19 6.58V11c0 4-2.9 8-7 9.16C7.9 19 5 15 5 11V6.58l7-2.4z"
                />
              </svg>
              RIZUU SOFTWARE
              <span style={styles.dot} className="desktop-only">•</span>
              <span className="desktop-only">Protected by End-to-End Enterprise Encryption</span>
              <span style={styles.dot}>•</span>
              Version 4.2.1
            </div>
          </Container>
        </div>
      </ConfigProvider>
    </ThemeProvider>
  )
}

export default App