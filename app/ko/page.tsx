"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, LogOut } from "lucide-react"

export default function KOPage() {
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const user = JSON.parse(currentUser)
    if (!user.isKO) {
      router.push("/calculator")
      return
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">No podemos cubrirte</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-red-600">
            Lamentablemente, según la información proporcionada, no podemos ofrecerte cobertura de seguro de salud en
            este momento.
          </p>
          <p className="text-sm text-gray-600">
            Si tienes alguna pregunta o crees que esto es un error, por favor contacta con nuestro servicio de atención
            al cliente.
          </p>
          <Button onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
