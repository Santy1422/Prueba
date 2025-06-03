"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, User, CreditCard, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

interface Lead {
  id: string
  userId: string
  phone: string
  totalPrice: number
  paymentData: any
  signatureData: any
  mainInsuredData: any
  additionalInsured: any[]
  hasCopay: boolean
}

export default function PortalPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!user.hasActivePolicy) {
      router.push("/calculator")
      return
    }

    // Cargar datos del lead/póliza
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

  const downloadDocument = () => {
    // Simular descarga del documento
    const element = document.createElement("a")
    const file = new Blob(["Documento de póliza de seguro de salud - Contrato firmado"], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "poliza-seguro-salud.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!lead || !user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Portal de Cliente</h1>
            <p className="text-green-600">Bienvenido, {user.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información de la póliza */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información de la Póliza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Estado:</span>
                <Badge className="bg-green-100 text-green-800">Activa</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Prima anual:</span>
                <span>{lead.totalPrice}€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Copago:</span>
                <span>{lead.hasCopay ? "Sí" : "No"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Asegurados:</span>
                <span>{1 + (lead.additionalInsured?.length || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Teléfono:</span>
                <span>{lead.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Información de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Método:</span>
                <span className="capitalize">{lead.paymentData?.method || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Frecuencia:</span>
                <span className="capitalize">{lead.paymentData?.frequency === "monthly" ? "Mensual" : "Anual"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Importe:</span>
                <span>
                  {lead.paymentData?.finalPrice || lead.totalPrice}€/
                  {lead.paymentData?.frequency === "monthly" ? "mes" : "año"}
                </span>
              </div>
              {lead.paymentData?.method === "card" && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tarjeta:</span>
                  <span>****{lead.paymentData.cardNumber}</span>
                </div>
              )}
              {lead.paymentData?.method === "sepa" && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">IBAN:</span>
                  <span>****{lead.paymentData.iban}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asegurados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Asegurados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-semibold">Asegurado Principal:</div>
                <div className="pl-4 space-y-1">
                  <div>Fecha de nacimiento: {lead.mainInsuredData?.birthDate || "N/A"}</div>
                  <div>Edad actuarial: {lead.mainInsuredData?.actuarialAge || "N/A"} años</div>
                </div>
              </div>

              {lead.additionalInsured?.map((insured, index) => (
                <div key={insured.id || index} className="space-y-2">
                  <div className="font-semibold">Asegurado {index + 2}:</div>
                  <div className="pl-4 space-y-1">
                    <div>Fecha de nacimiento: {insured.birthDate}</div>
                    <div>Edad actuarial: {insured.actuarialAge} años</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Documento */}
          <Card>
            <CardHeader>
              <CardTitle>Documento de Póliza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">CONTRATO DE SEGURO DE SALUD</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Documento firmado el:{" "}
                  {lead.signatureData?.signedAt ? new Date(lead.signatureData.signedAt).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm">
                  Este documento contiene los términos y condiciones de su póliza de seguro de salud.
                </p>
              </div>

              <Button onClick={downloadDocument} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Descargar Documento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
