"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Calculator, CreditCard, FileText } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

interface Lead {
  id: string
  userId: string
  phone: string
  totalPrice: number
  status: string
  createdAt: string
  paymentData?: any
}

export default function DashboardPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.isKO) {
      router.push("/ko")
      return
    }
    if (user.hasActivePolicy) {
      router.push("/portal")
      return
    }
    if (!user.hasActiveLead) {
      router.push("/calculator")
      return
    }

    // Cargar lead activo
    const loadUserData = async () => {
      try {
        const response = await apiClient.getUserProfile()
        if (response.data && response.data.currentLead) {
          setLead(response.data.currentLead)
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
      }
    }

    loadUserData()
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const continueProcess = () => {
    if (!lead) return

    switch (lead.status) {
      case "calculated":
        router.push("/subscription")
        break
      case "subscription":
        router.push("/payment")
        break
      case "payment":
        router.push("/signature")
        break
      default:
        router.push("/calculator")
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "calculated":
        return "Precio calculado"
      case "subscription":
        return "Preguntas completadas"
      case "payment":
        return "Pago realizado"
      case "signed":
        return "Contrato firmado"
      default:
        return "En proceso"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "calculated":
        return "bg-blue-100 text-blue-800"
      case "subscription":
        return "bg-yellow-100 text-yellow-800"
      case "payment":
        return "bg-orange-100 text-orange-800"
      case "signed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextStep = (status: string) => {
    switch (status) {
      case "calculated":
        return "Continuar con preguntas de suscripción"
      case "subscription":
        return "Proceder al pago"
      case "payment":
        return "Firmar contrato"
      default:
        return "Continuar proceso"
    }
  }

  if (!user || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Panel de Usuario</h1>
            <p className="text-blue-600">Bienvenido, {user.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Lead activo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tu Proceso de Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Estado actual:</span>
              <Badge className={getStatusColor(lead.status)}>{getStatusText(lead.status)}</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Precio calculado:</span>
                <span className="text-lg font-bold text-green-600">{lead.totalPrice}€/año</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Teléfono:</span>
                <span>{lead.phone}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Fecha de inicio:</span>
                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>

              {lead.paymentData && (
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">Pago Procesado</span>
                  </div>
                  <div className="text-sm text-green-600">
                    Método: {lead.paymentData.method === "card" ? "Tarjeta" : "SEPA"} | Importe:{" "}
                    {lead.paymentData.finalPrice}€/{lead.paymentData.frequency === "monthly" ? "mes" : "año"}
                  </div>
                </div>
              )}
            </div>

            {/* Progreso visual */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso</span>
                <span>
                  {lead.status === "calculated" && "25%"}
                  {lead.status === "subscription" && "50%"}
                  {lead.status === "payment" && "75%"}
                  {lead.status === "signed" && "100%"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width:
                      lead.status === "calculated"
                        ? "25%"
                        : lead.status === "subscription"
                          ? "50%"
                          : lead.status === "payment"
                            ? "75%"
                            : lead.status === "signed"
                              ? "100%"
                              : "0%",
                  }}
                />
              </div>
            </div>

            {lead.status !== "signed" && (
              <Button onClick={continueProcess} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {getNextStep(lead.status)}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
