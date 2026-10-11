import { useEffect, useState } from 'react'
import { createContext, useContext } from 'react'
import { api, type DcsUser } from '@/lib/api'

interface AuthState {
  user: DcsUser | null
  loading: boolean
  signIn: (user: DcsUser) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DcsUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .session()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const signIn = (next: DcsUser) => setUser(next)

  const signOut = async () => {
    await api.logout().catch(() => {})
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
