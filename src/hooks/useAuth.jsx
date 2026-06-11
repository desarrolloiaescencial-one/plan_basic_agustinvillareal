/* ── ./hooks/useAuth.jsx */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import sheetsApi from '../services/sheetsApi.js'

/* ── Contexto de Autenticación ──────────────────────────────
   Usa sheetsApi.auth para comunicarse con el Apps Script.
   El session_token se persiste en localStorage via sheetsApi.
   ─────────────────────────────────────────────────────────── */

const AuthContext = createContext(null)

// Clave para persistir el usuario en sessionStorage
const USER_KEY = 'prode_user'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try {
      const stored = sessionStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Si hay token guardado pero no user en memoria, limpiar (sesión inválida)
  useEffect(() => {
    if (!sheetsApi._token.get()) {
      setUser(null)
      sessionStorage.removeItem(USER_KEY)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      // sheetsApi.auth.login guarda el session_token automáticamente
      const data = await sheetsApi.auth.login(email, password)
      setUser(data.user)
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      // sheetsApi.auth.logout limpia el token aunque el servidor falle
      await sheetsApi.auth.logout()
    } finally {
      setUser(null)
      setError(null)
      sessionStorage.removeItem(USER_KEY)
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (nombre, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await sheetsApi.auth.registro(nombre, email, password)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

const isAdmin = !!(
  user?.rol === 'admin' ||
  user?.role === 'admin' ||
  user?.es_admin === true ||
  user?.tipo_usuario === 'admin'
)

  // Plan de la empresa del usuario logueado.
  // Si la columna empresa está vacía, se considera Plan_pro por defecto
  // (mismo criterio que el backend en esPlanBasic_).
  const empresa = String(user?.empresa || '').trim().toLowerCase()
  const isPlanBasic = empresa === 'plan_basic'
  const isPro = !isPlanBasic

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      register,
      isAdmin,
      isPlanBasic,
      isPro,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
