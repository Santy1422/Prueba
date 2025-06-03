"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calculator, Shield, CreditCard, FileText } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function WelcomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
  }, [user, router])

  const handleStartCalculator = () => {
    router.push("/calculator")
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">¡Bienvenido, {user.name}!</CardTitle>
            <p className="text-green-600 text-lg">
              Tu cuenta ha sido creada exitosamente. Ahora puedes calcular tu seguro de salud personalizado.
            </p>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calculator className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Calculadora</h3>
              <p className="text-sm text-gray-600">Calcula tu precio personalizado según tu edad y necesidades</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Cobertura</h3>
              <p className="text-sm text-gray-600">Cobertura médica completa con opciones de copago</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CreditCard className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Pago Flexible</h3>
              <p className="text-sm text-gray-600">Pago mensual o anual con tarjeta o SEPA</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Firma Digital</h3>
              <p className="text-sm text-gray-600">Proceso 100% digital sin papeleos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-gray-600 mb-6">
              Calcula tu precio personalizado en menos de 5 minutos. Solo necesitamos algunos datos básicos.
            </p>
            <Button onClick={handleStartCalculator} size="lg" className="px-8">
              Calcular mi Seguro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
