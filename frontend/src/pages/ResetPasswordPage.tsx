import {
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Button as AntButton } from 'antd'
import {
  ArrowLeft,
  KeyRound,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AUTH_MESSAGES,
  AuthAlert,
  type AuthAlertData,
  AuthCard,
  AuthLayout,
  authFormStyles,
} from '@/components/auth'

const styles = {
  ...authFormStyles,
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
    marginBottom: '2px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.5,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
} as const

export function ResetPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [alertData, setAlertData] = useState<AuthAlertData | null>(null)

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = identifier.trim()
    if (!trimmed) {
      setAlertData(AUTH_MESSAGES.fieldRequired('Work.ID atau email terdaftar'))
      return
    }

    setLoading(true)
    setAlertData(null)

    // Simulate sending reset password instructions
    setTimeout(() => {
      setLoading(false)
      setAlertData(AUTH_MESSAGES.resetEmailSuccess())
    }, 800)
  }

  const helpContent = (
    <Typography sx={styles.help}>
      Mengalami kendala akun?{' '}
      <a href="#" style={styles.helpLink} onClick={(e) => e.preventDefault()} className="hover:underline">
        Hubungi IT Support
      </a>
    </Typography>
  )

  return (
    <AuthLayout helpContent={helpContent}>
      <AuthCard>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrapper}>
            <KeyRound size={22} />
          </div>
          <Typography sx={styles.cardTitle}>Reset Password</Typography>
          <Typography sx={styles.cardSubtitle}>
            Masukkan email atau Work.ID terdaftar untuk menerima petunjuk reset password Anda.
          </Typography>
        </div>

        {/* Modular AuthAlert Component */}
        {alertData && (
          <AuthAlert
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            onClose={() => setAlertData(null)}
          />
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Typography sx={styles.label}>
              Work.ID / Email Terdaftar
              <span style={styles.asterisk}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="nama@perusahaan.com atau DCS-ID"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value)
                if (alertData?.type === 'error') setAlertData(null)
              }}
              disabled={loading}
              sx={styles.input}
              slotProps={{
                input: {
                  autoComplete: 'email',
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.45)', ml: 0.5 }}>
                      <Mail size={18} />
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
            style={{ ...styles.primaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            className="w-full cursor-pointer"
          >
            {loading ? (
              'Mengirim...'
            ) : alertData?.type === 'success' ? (
              <>
                <RefreshCw size={16} />
                Kirim Ulang
              </>
            ) : (
              'Reset Password'
            )}
          </AntButton>

          <div style={{ textAlign: 'center', marginTop: '2px' }}>
            <Link
              to="/"
              style={styles.backLink}
              className="hover:text-white hover:underline transition-colors duration-150"
            >
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
