import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  api,
  decodeToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
  type Role,
} from '../api/client'
import { can as canRole, type Capability } from '../features/auth/permissions'

export interface Session {
  username: string
  role: Role
}

interface AuthContextValue {
  user: Session | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<Session>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
  can: (capability: Capability) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(() => {
    const token = getToken()
    return token ? decodeToken(token) : null
  })

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null)
      setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await api.auth.login(username, password)
    const session = decodeToken(token)
    if (!session) throw new Error('Invalid token received')
    setToken(token)
    setUser(session)
    return session
  }, [])

  const hasRole = useCallback((...roles: Role[]) => !!user && roles.includes(user.role), [user])
  const can = useCallback(
    (capability: Capability) => canRole(user?.role, capability),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, logout, hasRole, can }),
    [user, login, logout, hasRole, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}