"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string
  phone?: string
  hasActiveLead: boolean
  hasActivePolicy: boolean
  isKO: boolean
  leadId?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string; message?: string; isNewUser?: boolean }>
  googleAuth: () => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      apiClient.setToken(token)
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const response = await apiClient.getUserProfile()
      if (response.data) {
        setUser(response.data.user)
      } else {
        logout()
      }
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { success: false, error: "Email y contraseña son requeridos" }
      }

      const response = await apiClient.login(email, password)
      if (response.data) {
        apiClient.setToken(response.data.token)
        setUser(response.data.user)
        return { success: true, message: "¡Bienvenido de vuelta!" }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: "Error de conexión. Inténtalo de nuevo." }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      // Validaciones del lado cliente
      if (!email || !password || !name) {
        return { success: false, error: "Todos los campos son requeridos" }
      }

      if (password.length < 6) {
        return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
      }

      const response = await apiClient.register(email, password, name)
      if (response.data) {
        apiClient.setToken(response.data.token)
        setUser(response.data.user)
        return { success: true, message: "¡Cuenta creada exitosamente!", isNewUser: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: "Error de conexión. Inténtalo de nuevo." }
    }
  }

  const googleAuth = async () => {
    try {
      const response = await apiClient.googleAuth()
      if (response.data) {
        apiClient.setToken(response.data.token)
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: "Error de conexión" }
    }
  }

  const logout = () => {
    apiClient.removeToken()
    setUser(null)
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    googleAuth,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
