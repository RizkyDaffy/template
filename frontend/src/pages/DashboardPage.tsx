import { Button as AntButton } from 'antd'
import { LogOut } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout, authLayoutStyles } from '@/components/auth'
import { useAuth } from '@/lib/auth'

export function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div style={{ ...authLayoutStyles.page, justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Memuat…</span>
      </div>
    )
  }

  // Declarative redirect — no side effects during render.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <AuthLayout title={`Halo, ${user.name ?? user.workId}`}>
      <div
        style={{
          background: '#1a1b1f',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '24px',
          width: '100%',
          maxWidth: '375px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Detail Akun</span>
        <Detail label="Work.ID" value={user.workId} />
        <Detail label="Nama" value={user.name ?? '—'} />
        <Detail label="Email" value={user.email ?? '—'} />
        <Detail label="Role" value={user.role} />
        <AntButton
          type="primary"
          danger
          onClick={handleLogout}
          icon={<LogOut size={16} />}
          style={{ height: 44, borderRadius: 10, fontWeight: 600, marginTop: 8 }}
          className="cursor-pointer"
        >
          Logout
        </AntButton>
      </div>
    </AuthLayout>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
      <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ color: '#fff', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
