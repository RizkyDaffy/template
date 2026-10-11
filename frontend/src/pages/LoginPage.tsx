import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Button as AntButton, Divider } from 'antd'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AUTH_MESSAGES,
  AuthAlert,
  type AuthAlertData,
  AuthCard,
  AuthLayout,
  authFormStyles,
} from '@/components/auth'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const styles = {
  ...authFormStyles,
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
    transition: 'color 0.2s ease',
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
  scenarioBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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

export function LoginPage() {
  const [workId, setWorkId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alertData, setAlertData] = useState<AuthAlertData | null>(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedWorkId = workId.trim()
    const trimmedPassword = password

    if (!trimmedWorkId || !trimmedPassword) {
      setAlertData(AUTH_MESSAGES.fieldRequired())
      return
    }

    setLoading(true)
    setAlertData(null)
    try {
      const { user } = await api.login(trimmedWorkId, trimmedPassword)
      signIn(user)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertData({
          type: err.status === 423 ? 'warning' : 'error',
          title: 'Gagal Masuk',
          message: err.message,
        })
      } else {
        setAlertData(AUTH_MESSAGES.loginFailed())
      }
    } finally {
      setLoading(false)
    }
  }

  const helpContent = (
    <Typography sx={styles.help}>
      Need assistance signing in?{' '}
      <a href="#" style={styles.helpLink} onClick={(e) => e.preventDefault()} className="hover:underline">
        Contact IT Support
      </a>
    </Typography>
  )

  return (
    <AuthLayout helpContent={helpContent}>
      <AuthCard>
        {/* Modular AuthAlert Component */}
        {alertData && (
          <AuthAlert
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            onClose={() => setAlertData(null)}
          />
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Typography sx={styles.label}>
              Work.ID
              <span style={styles.asterisk}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your work ID"
              value={workId}
              onChange={(e) => {
                setWorkId(e.target.value)
                if (alertData?.type === 'error') setAlertData(null)
              }}
              disabled={loading}
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
              <Link to="/reset" style={styles.forgot} className="hover:text-white hover:underline">
                Forgot password?
              </Link>
            </div>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (alertData?.type === 'error') setAlertData(null)
              }}
              disabled={loading}
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

          <AntButton
            type="primary"
            htmlType="submit"
            loading={loading}
            style={styles.primaryBtn}
            className="w-full cursor-pointer"
          >
            {loading ? 'Memverifikasi...' : 'Login'}
          </AntButton>

          <Divider style={styles.or}>OR</Divider>

          <AntButton
            type="default"
            onClick={() => {
              window.location.href = api.googleUrl
            }}
            style={styles.googleBtn}
            className="cursor-pointer"
          >
            <GoogleIcon />
            Sign in with Google
          </AntButton>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
