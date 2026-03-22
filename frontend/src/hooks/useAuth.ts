import { createContext, useContext, useEffect, useState, useCallback, ReactNode, createElement } from 'react'
import { authApi } from '../api/client'
import { User } from '../types'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      authApi.me()
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data } = await authApi.register({ email, password, name })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken') || ''
    await authApi.logout(refreshToken).catch(() => {})
    localStorage.clear()
    setUser(null)
  }, [])

  return createElement(AuthContext.Provider, { value: { user, loading, login, register, logout } }, children)
}

export const useAuth = () => useContext(AuthContext)
