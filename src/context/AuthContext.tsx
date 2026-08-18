import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AppUser } from '../types'
import { verifyPassword } from '../utils/password'
import type { Store } from '../store/useStore'

const SESSION_KEY = 'buildflow-session'

interface AuthContextValue {
  currentUser: AppUser | null
  login: (username: string, password: string) => Promise<string | null>
  logout: () => void
  isAdmin: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSessionUserId(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function AuthProvider({ store, children }: { store: Store; children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(loadSessionUserId)

  const currentUser = useMemo(
    () => store.data.users.find((u) => u.id === userId && u.status === 'active') ?? null,
    [store.data.users, userId],
  )

  const login = useCallback(
    async (username: string, password: string): Promise<string | null> => {
      const user = store.data.users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase().trim(),
      )
      if (!user) return 'Invalid username or password.'
      if (user.status !== 'active') return 'This account is inactive. Contact an administrator.'
      const valid = await verifyPassword(password, user.passwordHash)
      if (!valid) return 'Invalid username or password.'

      const now = new Date().toISOString()
      store.update((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === user.id ? { ...u, lastLogin: now } : u,
        ),
      }))
      sessionStorage.setItem(SESSION_KEY, user.id)
      setUserId(user.id)
      return null
    },
    [store],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setUserId(null)
  }, [])

  const value: AuthContextValue = {
    currentUser,
    login,
    logout,
    isAdmin: currentUser?.role === 'admin',
    isManager: currentUser?.role === 'admin' || currentUser?.role === 'manager',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
