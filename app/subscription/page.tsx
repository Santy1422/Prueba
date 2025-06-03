"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

export default function SubscriptionPage() {
  const [isSmoker, setIsSmoker] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { user, refreshUser } = useAuth()
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
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSmoker) {
      alert("Por favor, responde a la pregunta")
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.submitSubscription(isSmoker === "yes")

      if (response.data) {
        await refreshUser()

        if (response.data.status === "ko") {
          router.push("/ko")
        } else {
          router.push("/payment")
        }
      } else {
        alert(response.error || "Error al procesar la respuesta")
      }
    } catch (error) {
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Motor de Suscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Eres fumador?</Label>
                <RadioGroup value={isSmoker} onValueChange={setIsSmoker}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Procesando..." : "Continuar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
