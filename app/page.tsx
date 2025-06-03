"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)
  const { user, login, register, googleAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    // Inicializar base de datos en el primer acceso
    const initializeDatabase = async () => {
      try {
        await fetch("/api/init-db", { method: "POST" })
        setDbInitialized(true)
      } catch (error) {
        console.error("Error inicializando base de datos:", error)
      }
    }

    initializeDatabase()
  }, [])

  useEffect(() => {
    if (user && !authLoading) {
      redirectUser(user)
    }
  }, [user, authLoading])

  const redirectUser = (user: any, isNewUser = false) => {
    if (isNewUser) {
      router.push("/welcome")
    } else if (user.isKO) {
      router.push("/ko")
    } else if (user.hasActivePolicy) {
      router.push("/portal")
    } else if (user.hasActiveLead) {
      router.push("/dashboard")
    } else {
      router.push("/calculator")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        const result = await login(email, password)
        if (result.success) {
          setMessage({ type: "success", text: result.message || "Login exitoso" })
          // No redirigir inmediatamente, el useEffect se encargará
        } else {
          setMessage({ type: "error", text: result.error || "Error en el login" })
        }
      } else {
        const result = await register(email, password, name)
        if (result.success) {
          setMessage({ type: "success", text: result.message || "Cuenta creada exitosamente" })
          // Redirigir a welcome para usuarios nuevos
          setTimeout(() => {
            router.push("/welcome")
          }, 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Error en el registro" })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      const result = await googleAuth()
      if (!result.success) {
        alert(result.error || "Error con Google OAuth")
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Inicializando aplicación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">Seguros de Salud</CardTitle>
          <CardDescription>Accede a tu cuenta o crea una nueva cuenta gratuita</CardDescription>
          <div className="text-xs text-gray-500 mt-2">
            <div>Usuario de prueba: test@example.com / password123</div>
            <div className="mt-1 text-green-600">O crea tu propia cuenta en la pestaña "Registrarse"</div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" onClick={() => setIsLogin(true)}>
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="register" onClick={() => setIsLogin(false)}>
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {message && (
                <Alert variant={message.type === "success" ? "success" : "destructive"} className="mb-4">
                  {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                <strong>¡Crea tu cuenta gratuita!</strong>
                <br />
                Solo necesitas un email válido y una contraseña segura para comenzar.
              </div>
              {message && (
                <Alert variant={message.type === "success" ? "success" : "destructive"} className="mb-4">
                  {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cargando..." : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <div className="text-xs text-center text-gray-500 mb-2">O continúa con Google (simulado)</div>
            <Button variant="outline" className="w-full" onClick={handleGoogleAuth} disabled={loading}>
              {loading ? "Cargando..." : "Continuar con Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
