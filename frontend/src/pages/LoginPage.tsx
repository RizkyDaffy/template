import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Button as AntButton, Divider } from 'antd'
import { Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AUTH_MESSAGES,
  AuthAlert,
  type AuthAlertData,
  AuthCard,
  AuthLayout,
  authFormStyles,
} from '@/components/auth'

const MAX_LOGIN_ATTEMPTS = 3
const LOCKOUT_DURATION_SECONDS = 60

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
  const [googleLoading, setGoogleLoading] = useState(false)

  // Rate Limiting / 3x Retries + 1 Minute Lockout
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [alertData, setAlertData] = useState<AuthAlertData | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)

  const isLocked = lockoutSeconds > 0

  // Cooldown countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          // Lockout ended, reset counter
          setFailedAttempts(0)
          setAlertData({
            type: 'info',
            title: 'Kunci Dibuka',
            message: 'Masa tunggu selesai. Anda dapat mencoba login kembali.',
          })
          return 0
        }
        const updated = prev - 1
        setAlertData(AUTH_MESSAGES.lockout(updated))
        return updated
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [lockoutSeconds])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      setAlertData(AUTH_MESSAGES.lockout(lockoutSeconds))
      return
    }

    const trimmedWorkId = workId.trim()
    const trimmedPassword = password.trim()

    if (!trimmedWorkId || !trimmedPassword) {
      setAlertData(AUTH_MESSAGES.fieldRequired())
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      // Skenario 1: Backend / Server terputus
      if (trimmedWorkId === 'offline' || trimmedPassword === 'offline') {
        setAlertData(AUTH_MESSAGES.serverDisconnected())
        return
      }

      // Skenario 2: Akun tidak terdaftar / kredensial tidak valid
      if (
        trimmedWorkId === 'unregistered' ||
        trimmedWorkId === 'unknown' ||
        trimmedWorkId.toLowerCase().includes('notfound')
      ) {
        setAlertData(AUTH_MESSAGES.invalidCredentials())
        return
      }

      // Skenario 3: Login gagal umum
      if (trimmedWorkId === 'error') {
        setAlertData(AUTH_MESSAGES.loginFailed())
        return
      }

      // Skenario 4: Login sukses (jika kredensial valid)
      if (trimmedWorkId === 'admin' && trimmedPassword === 'admin123') {
        setFailedAttempts(0)
        setAlertData(AUTH_MESSAGES.googleSuccess())
        return
      }

      // Skenario 5: Salah password dengan counter 3x & lockout 1 menit
      const nextFailed = failedAttempts + 1
      setFailedAttempts(nextFailed)

      if (nextFailed >= MAX_LOGIN_ATTEMPTS) {
        // Trigger 1-minute lockout
        setLockoutSeconds(LOCKOUT_DURATION_SECONDS)
        setAlertData(AUTH_MESSAGES.lockout(LOCKOUT_DURATION_SECONDS))
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - nextFailed
        setAlertData(AUTH_MESSAGES.wrongPassword(remaining))
      }
    }, 600)
  }

  // Google 3rd party auth handler
  const handleGoogleLogin = () => {
    if (isLocked) {
      setAlertData(AUTH_MESSAGES.lockout(lockoutSeconds))
      return
    }

    setGoogleLoading(true)
    setAlertData(null)

    setTimeout(() => {
      setGoogleLoading(false)
      setFailedAttempts(0)
      setAlertData(AUTH_MESSAGES.googleSuccess())
    }, 900)
  }

  const helpContent = (
    <div className="flex flex-col items-center gap-3">
      <Typography sx={styles.help}>
        Need assistance signing in?{' '}
        <a href="#" style={styles.helpLink} onClick={(e) => e.preventDefault()} className="hover:underline">
          Contact IT Support
        </a>
      </Typography>

      {/* Quick Interactive Testing Bar for All Requested Alerts */}
      <button
        type="button"
        onClick={() => setShowSimulator((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs text-indigo-400/80 hover:text-indigo-300 transition-colors cursor-pointer bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-500/20"
      >
        <Sparkles size={13} />
        {showSimulator ? 'Sembunyikan Simulasi Alert' : 'Simulasi Cepat Alert (Klik untuk Coba)'}
      </button>

      {showSimulator && (
        <div className="w-full max-w-[375px] p-3 rounded-xl bg-[#16171b] border border-white/10 flex flex-col gap-2 mt-1 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
            <ShieldAlert size={14} className="text-indigo-400" />
            Uji Langsung Kasus Alert:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                const nextFailed = failedAttempts + 1
                setFailedAttempts(nextFailed)
                if (nextFailed >= MAX_LOGIN_ATTEMPTS) {
                  setLockoutSeconds(LOCKOUT_DURATION_SECONDS)
                  setAlertData(AUTH_MESSAGES.lockout(LOCKOUT_DURATION_SECONDS))
                } else {
                  setAlertData(AUTH_MESSAGES.wrongPassword(MAX_LOGIN_ATTEMPTS - nextFailed))
                }
              }}
              style={styles.scenarioBadge}
              className="hover:bg-white/15 hover:text-white"
            >
              Salah Password ({Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts)}x lagi)
            </button>
            <button
              type="button"
              onClick={() => {
                setFailedAttempts(MAX_LOGIN_ATTEMPTS)
                setLockoutSeconds(LOCKOUT_DURATION_SECONDS)
                setAlertData(AUTH_MESSAGES.lockout(LOCKOUT_DURATION_SECONDS))
              }}
              style={styles.scenarioBadge}
              className="hover:bg-amber-500/20 hover:text-amber-200"
            >
              Kunci 1 Menit (Lockout)
            </button>
            <button
              type="button"
              onClick={() => setAlertData(AUTH_MESSAGES.invalidCredentials())}
              style={styles.scenarioBadge}
              className="hover:bg-rose-500/20 hover:text-rose-200"
            >
              Kredensial Tidak Valid
            </button>
            <button
              type="button"
              onClick={() => setAlertData(AUTH_MESSAGES.googleSuccess())}
              style={styles.scenarioBadge}
              className="hover:bg-emerald-500/20 hover:text-emerald-200"
            >
              Google Auth Berhasil
            </button>
            <button
              type="button"
              onClick={() => setAlertData(AUTH_MESSAGES.loginFailed())}
              style={styles.scenarioBadge}
              className="hover:bg-rose-500/20 hover:text-rose-200"
            >
              Login Gagal
            </button>
            <button
              type="button"
              onClick={() => setAlertData(AUTH_MESSAGES.serverDisconnected())}
              style={styles.scenarioBadge}
              className="hover:bg-rose-500/20 hover:text-rose-200"
            >
              Server Terputus
            </button>
          </div>
        </div>
      )}
    </div>
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
                if (alertData?.type === 'error' && !isLocked) setAlertData(null)
              }}
              disabled={loading || googleLoading || isLocked}
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
                if (alertData?.type === 'error' && !isLocked) setAlertData(null)
              }}
              disabled={loading || googleLoading || isLocked}
              sx={styles.input}
              slotProps={{
                input: {
                  autoComplete: 'current-password',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        disabled={isLocked}
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
            disabled={isLocked}
            style={styles.primaryBtn}
            className="w-full cursor-pointer"
          >
            {isLocked
              ? `Terkunci (${lockoutSeconds}s)`
              : loading
                ? 'Memverifikasi...'
                : 'Login'}
          </AntButton>

          <Divider style={styles.or}>OR</Divider>

          <AntButton
            type="default"
            loading={googleLoading}
            disabled={isLocked}
            onClick={handleGoogleLogin}
            style={styles.googleBtn}
            className="cursor-pointer"
          >
            {!googleLoading && <GoogleIcon />}
            Sign in with Google
          </AntButton>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
